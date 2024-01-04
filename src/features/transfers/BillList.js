import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect } from "react"
import { encoding } from "../../data/encoding"
import useAuth from "../../hooks/useAuth";
import { getGst } from "../utilities/GstCalc"

import { useGetLedgerQuery, useAddNewLedgerMutation } from "../ledger/ledgerApiSlice"
import { useGetBillNosQuery, useUpdateBillNoMutation, categorySelect, finyearNow, pad } from "./billNoApiSlice"
import { useGetMembersQuery, useAddNewMemberMutation, useUpdateMemberMutation } from "../membership/membersApiSlice"

//import { useGetSkusQuery } from "../skus/skusApiSlice"
//import { useGetInventoryQuery, useAddNewInventoryMutation, useUpdateInventoryMutation } from "../inventory/inventoryApiSlice"
import { useGetSkuinvQuery, useUpdateSkuinvMutation } from '../skuinv/skuinvApiSlice';


import { useAddNewEmailMutation } from "./emailApiSlice"
import ReturnLedger from "./ReturnLedger"

import { useNavigate } from "react-router-dom"
import Popup from "../../components/Popup"

const BillList = () => {
    const [newEntry, setNewEntry] = useState('')
    const [editPrice, setEditPrice] = useState(false)
    const [newSearch, setNewSearch] = useState('')
    const [bill, setBill] = useState([])
    const [total, setTotal] = useState(0)
    const [factor, setFactor] = useState(0)
    const [returnBillNo, setReturnBillNo] = useState('XYZ');
    const [returnBillContent, setReturnBillContent] = useState([]);
    const [billNo, setBillNo] = useState([]);
    //const [returnBillTable, setReturnBillTable] = useState();

    const [action, setAction] = useState('')
    const [store, setStore] = useState('')
    const [source, setSource] = useState('')
    const [destination, setDestination] = useState('')
    const [otherSeller, setOtherSeller] = useState('')

    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [orderType, setOrderType] = useState('')
    const [paymentType, setPaymentType] = useState('')
    const [membership, setMembership] = useState('')
    const [validQty, setValidQty] = useState(true)
    const [validMember, setValidMember] = useState(false)

    const [addedSkus, setAddedSkus] = useState('')
    const [popupTrigger, setPopupTrigger] = useState(false)
    const [newMembership, setNewMembership] = useState('')
    const [existingMember, setExistingMember] = useState('')

    const [updateError, setUpdateError] = useState('')
    const [errorPopup, setErrorPopup] = useState(false)

    const navigate = useNavigate()

    const { isAdInCharge, isBaInCharge, isPoInCharge, isShopManager, isInventoryManager, isAdmin, status } = useAuth()

    const {
        data: billnos,
        isLoading: billLoading,
        isSuccess: billSucecss,
        isError: billisError,
        error: billError
    } = useGetBillNosQuery('billnos', {
        pollingInterval: 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const [updatebillnos] = useUpdateBillNoMutation()

    const {
        data: ledger,
        isSuccess: ledgerSuccess
    } = useGetLedgerQuery('ledgerList', {
        pollingInterval: 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const [addledger, {
        isSuccess: addledgerSuccess,
        isError: addledgerisError,
        error: addledgerError
    }] = useAddNewLedgerMutation()

    const {
        data: skuinv,
        isLoading: SkuinvisLoading,
        isSuccess: SkuinvisSuccess,
        isError: SkuinvisError,
        error: SkuinvError
    } = useGetSkuinvQuery('skuinvList', {
        pollingInterval: 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const [updateskuinv, {
        isSuccess: updateSkuinvSuccess,
        isError: updateSkuinvisError,
        error: updateSkuinvError
    }] = useUpdateSkuinvMutation()

    const {
        data: members,
        isSuccess: memberSuccess,
        isError: memberisError,
        error: memberError
    } = useGetMembersQuery('membersList', {
        pollingInterval: 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const [addMember] = useAddNewMemberMutation()

    const [updateMember] = useUpdateMemberMutation()


    const [sendEmail] = useAddNewEmailMutation()

    useEffect(() => {

        const getTotal = () => {
            let mytotal = 0;
            bill.forEach(entry => {
                mytotal += (entry.mrp * entry.qty * factor)
            })
            setTotal(mytotal)
        }

        getTotal()

    }, [bill, factor])


    useEffect(() => {

        const identifySource = () => {
            let localSource
            if (isAdInCharge || isPoInCharge || isBaInCharge) localSource = status.toLowerCase()
            else if (isAdmin || isShopManager || isInventoryManager) {
                if (action === 'Billing') localSource = store.toLowerCase()
                else if (action === 'Internal') localSource = source.toLowerCase()
                else if (action === 'Inventory' && source === 'CWEFStore') localSource = 'cwefstore'
                else if (action === 'Inventory') localSource = 'source'
            }
            return localSource
        }

        const checkQty = () => {

            if (SkuinvisSuccess) {

                const { ids: invIds, entities: invEntities } = skuinv

                let qtyArr = []
                if (bill.length) {
                    bill.forEach(entry => {
                        let source = (entry.return === 1) ? 'sales' : identifySource()
                        const id = invIds.find(temp => invEntities[temp].barcode.toLowerCase() === entry.barcode.toLowerCase())
                        if (source === 'source') setValidQty(true)
                        else {
                            if (id) {
                                if (entry.qty > invEntities[id][source]) qtyArr.push(false)
                                else qtyArr.push(true)
                            } else qtyArr.push(false)
                        }
                    })
                } else qtyArr.push(true)

                setValidQty(qtyArr.every(Boolean))

            }
        }
        checkQty()

    }, [bill, skuinv, action, isAdInCharge, isBaInCharge, isPoInCharge, isAdmin, isInventoryManager, isShopManager, orderType, source, status, store, SkuinvisSuccess])

    useEffect(() => {
        let myfactor = 1
        if ((isAdmin || isShopManager || isInventoryManager) && (action === 'Inventory')) {
            if (source === 'CH' || destination === 'CH') myfactor = 0.5
            else if (source === 'CWEF' || destination === 'CWEF') myfactor = 0
        }
        if ((isAdmin || isShopManager || isInventoryManager) && (action === 'Internal')) myfactor = 0
        if (orderType === 'Internal') myfactor = 0

        setFactor(myfactor)

    }, [isAdmin, isShopManager, isInventoryManager, action, orderType, source, destination, bill])

    useEffect(() => {
        if (addledgerSuccess && updateSkuinvSuccess) {
            if ((isAdInCharge || isBaInCharge || isPoInCharge) || (action === 'Billing')) navigate(`/dash/shopaccounts/${billNo}`)
            else navigate(`/dash/inventory/${addedSkus}`)
        }
    }, [addledgerSuccess, updateSkuinvSuccess, action, navigate, billNo, addedSkus, isAdInCharge, isBaInCharge, isPoInCharge])

    useEffect(() => {
        if (addledgerisError || updateSkuinvisError || billisError || memberisError) {
            let errStr = "Bill No: " + billNo + " --- Added SKUs: " + addedSkus + " --- Ledger: " + addledgerError?.data?.message + " --- Update Inventory: " + updateSkuinvError?.data?.message
            errStr = errStr + "Membership no: " + newMembership + " --- Phone: " + phone + " --- Member Error: " + memberError + " --- BillNo error:" + billError
            setUpdateError(errStr)
            setErrorPopup(true)
        }
    }, [addledgerisError, updateSkuinvisError, billNo, addledgerError, updateSkuinvError, addedSkus, billisError, billError, memberisError, memberError, newMembership, phone])

    useEffect(() => {

        const checkMembersip = () => {
            if (memberSuccess) {
                const { ids: memberIds, entities: memberEntities } = members

                // Thi block is to check if an entered membership exists and has validity
                let mId = memberIds?.filter(id => (
                    memberEntities[id].barcode.toLowerCase() === membership?.toLowerCase() ||
                    memberEntities[id].phone.toLowerCase() === membership?.toLowerCase()
                ))
                if (mId[0]) {
                    const dayspast = Number((new Date() - new Date(memberEntities[mId].time)) / 86400000)
                    if (dayspast > memberEntities[mId].duration) setValidMember(false)
                    else setValidMember(true)
                } else setValidMember(false)

                // This block is to check if membership purchase should create a NEW one or renew an older membership
                mId = memberIds?.filter(id => (
                    memberEntities[id].barcode.toLowerCase() === newMembership?.toLowerCase() ||
                    memberEntities[id].phone.toLowerCase() === newMembership?.toLowerCase()
                ))
                if (mId[0]) {
                    //console.log(memberEntities[mId[0]])
                    setExistingMember(mId[0])
                } else setExistingMember('')

            }
        }

        checkMembersip()

    }, [membership, memberSuccess, members, newMembership])

    useEffect(() => {

        const updatePrice = () => {

            if (bill.length) {

                if (SkuinvisSuccess && !editPrice) {
                    const { ids: skuIds, entities: skuEntities } = skuinv
                    bill.forEach(entry => {
                        if (!entry.return && entry.name !== 'NA') {
                            let skuid = skuIds.find(temp => skuEntities[temp].barcode.toLowerCase() === entry.barcode.toLowerCase())
                            if (validMember) {
                                entry.mrp = skuEntities[skuid].MBR
                                entry.gst = getGst(entry.hsn, skuEntities[skuid].MBR)
                            }
                            else {
                                entry.mrp = skuEntities[skuid].MRP
                                entry.gst = getGst(entry.hsn, skuEntities[skuid].MRP)
                            }
                        }
                    })
                }

            }


        }
        updatePrice()

    }, [bill, SkuinvisSuccess, skuinv, validMember, editPrice])


    useEffect(() => {

        const billwithReturns = () => {
            let myBill = [...bill]

            returnBillContent.forEach(entry => {
                if (entry.Return !== 0) {
                    const index = myBill.findIndex((obj) => obj.barcode === entry.Barcode)
                    if (index !== -1) {
                        myBill[index].qty -= entry.Return
                        entry.Return = 0
                    }
                    else {
                        myBill = [...bill, { barcode: entry.Barcode, name: entry.Name, qty: (-entry.Return), mrp: ((entry.Price / entry.Qty)), hsn: entry.hsn, gst: entry.gst, return: 1 }]
                        entry.Return = 0
                    }
                    setBill(myBill)
                }
            })


        }

        billwithReturns()

    }, [returnBillContent, bill])

    let shopHeaderSection
    let newInvHeaderSection
    let newItemSection
    let discountSection
    let content
    let searchtableContent
    let returnBillSection

    if (SkuinvisLoading) content = <p>Loading...</p>
    if (SkuinvisError) content = <p className="errmsg">{SkuinvError?.data?.message}</p>

    if (SkuinvisSuccess) {

        const { ids, entities } = skuinv
        let skuIds = ids.filter(sku => (entities[sku].name.toLowerCase().includes(newSearch.toLowerCase())))

        if (billLoading) content = <p>Loading...</p>

        if (ledgerSuccess && orderType === 'Exchange') {

            const getReturnBill = () => {

                const { ids: ledgerIds, entities: ledgerEntities } = ledger
                let returnBillIds = ledgerIds.filter(ledger => (
                    (ledgerEntities[ledger].billno.toLowerCase() === returnBillNo.toLowerCase()) && returnBillNo.length === 12   // remove the previous comment before deployment
                ))
                const returnBilljson = returnBillIds?.length ? returnBillIds.map(ledgerId => {
                    return (
                        { Date: (new Intl.DateTimeFormat('en-US').format(new Date(ledgerEntities[ledgerId].createdAt))), Barcode: ledgerEntities[ledgerId].barcode, Name: ledgerEntities[ledgerId].name, Qty: ledgerEntities[ledgerId].qty, Price: ledgerEntities[ledgerId].totalprice, hsn: ledgerEntities[ledgerId].hsncode, gst: ledgerEntities[ledgerId].gst, Return: 0 }
                    )
                }) : null

                let consolidatedReturn = []
                for (let i = 0; i < returnBilljson?.length; i++) {
                    let found = false;
                    for (let j = 0; j < consolidatedReturn?.length; j++) {
                        if (consolidatedReturn[j].Barcode === returnBilljson[i].Barcode) {
                            found = true;
                            consolidatedReturn[j].Qty = consolidatedReturn[j].Qty + returnBilljson[i].Qty;
                            consolidatedReturn[j].Price = consolidatedReturn[j].Price + returnBilljson[i].Price;
                            break;
                        }
                    }
                    if (!found) consolidatedReturn.push(returnBilljson[i])

                }

                setReturnBillContent(consolidatedReturn)

            }

            const returnBillTable = returnBillContent?.map(entry => {
                return (
                    <ReturnLedger key={entry.barcode} entry={entry} />
                )
            })

            //console.log(returnBilljson)

            returnBillSection =
                <>
                    < div >
                        <input type="text" placeholder="Enter Bill No." onChange={e => setReturnBillNo(e.target.value)} />
                        <button onClick={getReturnBill}>GetBill</button>
                    </div >
                    <br></br>
                    <table>
                        <thead className="table__thead ledger--returnrow">
                            <tr>
                                <th scope="col" className="table__th ledger__ledgername">Date</th>
                                <th scope="col" className="table__th ledger__ledgername">Barcode</th>
                                <th scope="col" className="table__th ledger__ledgername">Name</th>
                                <th scope="col" className="table__th ledger__ledgername">Total Price</th>
                                <th scope="col" className="table__th ledger__ledgername">Qty</th>
                                <th scope="col" className="table__th ledger__ledgername">Return</th>
                            </tr>
                        </thead>
                        <tbody>
                            {returnBillTable}
                        </tbody>
                    </table>
                </>
        }

        if (billSucecss && memberSuccess) {

            const { ids: billids, entities: billentities } = billnos
            //console.log(finyearNow('1/1/2022'))
            //console.log(new Date())
            //console.log(finyearNow(0))

            let myUpdateBillStr = { id: billids[0], ad: 0, ba: 0, po: 0, ex: 0, db: 0, dn: 0, rs: 0, int: 0, os: 0, ip: 0, date: 0 }

            if (SkuinvisLoading) content = <p>Loading...</p>

            if (SkuinvisSuccess) {

                const { ids: invids, entities: inventities } = skuinv

                const getbillno = (seller, buyer) => {

                    if (seller === 'CH' && buyer === 'CWEFStore') { (myUpdateBillStr.db = 1); return (billentities[billids[0]].db); }
                    if (seller === 'OS' && buyer === 'CWEFStore') { (myUpdateBillStr.os = 1); return (billentities[billids[0]].os); }
                    if (seller === 'CWEF' && buyer === 'CWEFStore') { (myUpdateBillStr.ip = 1); return (billentities[billids[0]].ip); }
                    if (seller === 'CWEFStore' && buyer === 'CH') { (myUpdateBillStr.dn = 1); return (billentities[billids[0]].dn); }
                    if (seller === 'CWEFStore' && buyer === 'OS') { (myUpdateBillStr.rs = 1); return (billentities[billids[0]].rs); }
                    if ((seller === 'CWEFStore' || seller === 'Andheri' || seller === 'Bandra' || seller === 'Powai' || seller === 'Exhibition')
                        && (buyer === 'CWEFStore' || buyer === 'Andheri' || buyer === 'Bandra' || buyer === 'Powai' || buyer === 'Exhibition')) {
                        (myUpdateBillStr.int = 1); return (billentities[billids[0]].int);
                    }
                    if (seller === 'Andheri') { (myUpdateBillStr.ad = 1); return (billentities[billids[0]].ad); }
                    if (seller === 'Bandra') { (myUpdateBillStr.ba = 1); return (billentities[billids[0]].ba); }
                    if (seller === 'Powai') { (myUpdateBillStr.po = 1); return (billentities[billids[0]].po); }
                    if (seller === 'Exhibition') { (myUpdateBillStr.ex = 1); return (billentities[billids[0]].ex); }
                }

                const makeBill = async (e) => {
                    e.preventDefault()

                    let myorderType = ''
                    let mySeller = ''
                    let sellerCode = ''
                    let myBuyer = ''
                    let buyerCode = ''
                    let myPhone = ''
                    let myEmail = ''
                    let myPaymentType = ''
                    let myMembership = ''
                    let myAddedSkus = ''

                    if (isAdmin || isShopManager || isInventoryManager) {
                        if (action === 'Inventory') {
                            myPaymentType = 'Online'
                            if (source === 'CH') { myorderType = 'CHPurchase'; mySeller = 'CH'; myBuyer = 'CWEFStore'; sellerCode = mySeller; buyerCode = myBuyer }
                            else if (source === 'OS') { myorderType = 'OSPurchase'; mySeller = otherSeller; myBuyer = 'CWEFStore'; sellerCode = 'OS'; buyerCode = myBuyer }
                            else if (source === 'CWEF') { myorderType = 'InternalProduction'; mySeller = 'CWEF'; myBuyer = 'CWEFStore'; sellerCode = mySeller; buyerCode = myBuyer }
                            else if (source === 'CWEFStore') {
                                if (destination === 'CH') { myorderType = 'CHReturn'; myBuyer = 'CH'; buyerCode = myBuyer }
                                else if (destination === 'OS') { myorderType = 'OSReturn'; myBuyer = otherSeller; buyerCode = 'OS' }
                                mySeller = 'CWEFStore'; sellerCode = mySeller
                            }
                        }
                        else if (action === 'Internal') { myorderType = 'InternalTransfer'; myBuyer = destination; mySeller = source; myPaymentType = 'NA';; sellerCode = mySeller; buyerCode = myBuyer }
                        else if (action === 'Billing' && (isAdmin || isShopManager)) { myorderType = orderType; mySeller = store; myBuyer = name; myPhone = phone; myEmail = email; myPaymentType = (myorderType === 'Internal' ? 'NA' : paymentType); myMembership = membership; sellerCode = mySeller; buyerCode = 'Customer' }
                    } else if (isAdInCharge || isBaInCharge || isPoInCharge) { myorderType = orderType; mySeller = status; myBuyer = name; myPhone = phone; myEmail = email; myPaymentType = (myorderType === 'Internal' ? 'NA' : paymentType); myMembership = membership; sellerCode = mySeller; buyerCode = 'Customer' }

                    let mybillno
                    if (orderType !== 'Exchange') {
                        let billdigits = pad(getbillno(sellerCode, buyerCode))
                        if (finyearNow(billentities[billids[0]].date) !== finyearNow()) {
                            myUpdateBillStr.date = new Date()
                            billdigits = pad(1)
                        }
                        mybillno = `CH${categorySelect(sellerCode, buyerCode)}${finyearNow()}-${billdigits}`
                        console.log(mybillno)
                        await updatebillnos(myUpdateBillStr)
                    } else {
                        mybillno = returnBillNo
                    }
                    setBillNo(mybillno)

                    bill.forEach(entry => {
                        myAddedSkus = myAddedSkus ? (myAddedSkus + '-' + entry.barcode) : entry.barcode
                    })
                    setAddedSkus(myAddedSkus)

                    bill.forEach(async (entry) => {

                        if (entry.barcode.toUpperCase().match('FBFSBIA2001|FBFSCIA2001|FBFSDIA2001') && (isAdInCharge || isBaInCharge || isPoInCharge || (action === 'Billing'))) {
                            let membershipDuration = encoding.membership.find(temp => temp.barcode === entry.barcode).duration
                            if (newMembership) {
                                if (existingMember) {
                                    const { entities: memberentities } = members
                                    await updateMember({ id: existingMember, barcode: memberentities[existingMember].barcode, phone: phone, duration: membershipDuration, billno: mybillno, time: new Date() })
                                } else {
                                    await addMember({ barcode: newMembership, phone: phone, duration: membershipDuration, billno: mybillno, time: new Date() })
                                }
                            }
                        }

                        const ledgerEntry = { billno: mybillno, barcode: entry.barcode, name: entry.name, ordertype: myorderType, buyer: (myBuyer ? myBuyer : buyerCode), seller: mySeller, phone: myPhone, email: myEmail, paymenttype: myPaymentType, membership: myMembership, qty: entry.qty, totalprice: (entry.qty * entry.mrp * factor), hsncode: entry.hsn, gst: entry.gst }

                        const invId = invids.filter(id => (
                            inventities[id].barcode.toLowerCase() === entry.barcode.toLowerCase()
                        ))

                        let canSave = [invId[0], mybillno, entry.barcode, myorderType, (myBuyer || buyerCode), mySeller, myPaymentType, entry.qty, entry.hsn, entry.gst].every(Boolean)

                        if (canSave) {
                            const tqty = Number(entry.qty)
                            let updateInvStr = { source: 0, cwefstore: 0, andheri: 0, bandra: 0, powai: 0, exhibition: 0, sales: 0 }
                            if (['CH', 'CWEF', 'OS'].includes(sellerCode)) { updateInvStr.source = -tqty }
                            else if (sellerCode === 'CWEFStore') { updateInvStr.cwefstore = -tqty }
                            else if (sellerCode === 'Andheri') { updateInvStr.andheri = -tqty }
                            else if (sellerCode === 'Bandra') { updateInvStr.bandra = -tqty }
                            else if (sellerCode === 'Powai') { updateInvStr.powai = -tqty }
                            else if (sellerCode === 'Exhibition') { updateInvStr.exhibition = -tqty }

                            if (['CH', 'CWEF', 'OS'].includes(buyerCode)) { updateInvStr.source = tqty }
                            else if (buyerCode === 'CWEFStore') { updateInvStr.cwefstore = tqty }
                            else if (buyerCode === 'Andheri') { updateInvStr.andheri = tqty }
                            else if (buyerCode === 'Bandra') { updateInvStr.bandra = tqty }
                            else if (buyerCode === 'Powai') { updateInvStr.powai = tqty }
                            else if (buyerCode === 'Exhibition') { updateInvStr.exhibition = tqty }
                            else { updateInvStr.sales = tqty }

                            await updateskuinv({ id: invId[0], source: updateInvStr.source, cwefstore: updateInvStr.cwefstore, andheri: updateInvStr.andheri, bandra: updateInvStr.bandra, powai: updateInvStr.powai, exhibition: updateInvStr.exhibition, sales: updateInvStr.sales })
                            await addledger(ledgerEntry)
                        }
                        else {
                            console.log("Should never see this - ERROR - Swapnesh")
                        }
                    })

                    //console.log(billHtml)
                    let myemail
                    if ((isAdmin || isInventoryManager || isShopManager) && action === 'Inventory') myemail = 'shruti@creativehandicrafts.org'         // send to Accounts, ShopManager, Inventory Manager
                    else if ((isAdmin || isInventoryManager || isShopManager) && action === 'Internal') myemail = 'shruti@creativehandicrafts.org'      // send to ShopManager, Inventory Manager
                    else myemail = email // populate email from form
                    if (myemail) {
                        await sendEmail({ recipient: myemail, orderType: orderType, billno: mybillno, customer: myBuyer, factor: factor, messagebody: bill })
                    }
                }

                const deleteEntry = (barcode) => {
                    const myBill = [...bill]
                    const index = myBill.findIndex((obj) => obj.barcode === barcode)
                    myBill.splice(index, 1)
                    setBill(myBill)
                }

                const handleSubmit = (e) => {
                    e.preventDefault();

                    let myBill = [...bill]
                    let index

                    let skuId = ids.filter(sku => (entities[sku].barcode.toLowerCase() === newEntry.toLowerCase()))
                    if (skuId[0]) index = myBill.findIndex((obj) => obj.barcode.toLowerCase() === newEntry.toLowerCase())
                    else index = myBill.findIndex((obj) => obj.barcode === 'NA')

                    if (index !== -1) myBill[index].qty++
                    else {

                        //console.log(skuId)
                        if (skuId[0]) {
                            if (entities[skuId[0]].barcode.toUpperCase().match('FBFSBIA2001|FBFSCIA2001|FBFSDIA2001') && (isAdInCharge || isBaInCharge || isPoInCharge || (action === 'Billing'))) {
                                setPopupTrigger(true)
                            }
                            const myMrp = validMember ? entities[skuId[0]].MBR : entities[skuId[0]].MRP
                            const myGst = getGst(entities[skuId[0]].HSNCode, myMrp)
                            myBill = [...bill, {
                                barcode: entities[skuId[0]].barcode.toUpperCase(), name: entities[skuId[0]].name,
                                colour: (entities[skuId[0]].barcode.length === 11 ? (encoding.colour.find(item => item.IDENTITY === entities[skuId[0]].barcode.substr(5, 1).toUpperCase()).COLOUR) : ""),
                                size: (entities[skuId[0]].barcode.length === 11 ? (encoding.sizes.find(item => item.IDENTITY === entities[skuId[0]].barcode.substr(4, 1).toUpperCase()).SIZE) : ""),
                                qty: 1, mrp: myMrp, hsn: entities[skuId[0]].HSNCode, gst: myGst, return: 0
                            }]

                        } else {
                            myBill = [...bill, { barcode: 'NA', name: 'NA', colour: 'NA', size: 'NA', qty: 1, mrp: 0, hsn: 0, gst: 0, return: 0 }]    // This needs to be removed
                        }
                    }
                    setBill(myBill)
                    setNewEntry('')
                }

                const updateQty = (value, barcode) => {
                    let myBill = [...bill]
                    const index = myBill.findIndex((obj) => obj.barcode === barcode)
                    myBill[index].qty = value
                    setBill(myBill)
                }
                const updateMrp = (value, barcode) => {
                    let myBill = [...bill]
                    const index = myBill.findIndex((obj) => obj.barcode === barcode)
                    myBill[index].mrp = value
                    myBill[index].gst = getGst(myBill[index].hsn, value)
                    setBill(myBill)
                }

                const handleToggleEditPrice = () => setEditPrice(prev => !prev)

                newInvHeaderSection =
                    <form>
                        <div >

                            <label className="form__label" htmlFor="source">Select Action: </label>
                            <select id="action" name="action" size="1" value={action} onChange={(e) => setAction(e.target.value)} >
                                {[<option></option>, <option>Billing</option>, <option>Inventory</option>, <option>Internal</option>]}
                            </select>
                            <br></br>
                            <br></br>
                            {(action === 'Billing' && (isAdmin || isShopManager)) &&
                                <div>
                                    <label className="form__label" htmlFor="store"> Store: </label>
                                    <select id="store" name="store" size="1" value={store} onChange={(e) => setStore(e.target.value)} >
                                        {[<option></option>, <option>Andheri</option>, <option>Bandra</option>, <option>Powai</option>, <option>Exhibition</option>]}
                                    </select>
                                </div>
                            }
                            {(action === 'Inventory') &&
                                <div className="inventory--header">
                                    <label className="form__label" htmlFor="source"> Source: </label>
                                    <select id="source" name="source" size="1" value={source} onChange={(e) => setSource(e.target.value)} >
                                        {[<option></option>, <option>CH</option>, <option>OS</option>, <option>CWEF</option>, <option>CWEFStore</option>]}
                                    </select>
                                    <label className="form__label" htmlFor="destination"> Destination: </label>
                                    <select id="destination" name="destination" size="1" value={destination} onChange={(e) => setDestination(e.target.value)} >
                                        {[<option></option>, <option>CH</option>, <option>OS</option>, <option>CWEF</option>, <option>CWEFStore</option>]}
                                    </select>
                                    {(source === 'OS' || destination === 'OS') &&
                                        <>
                                            <input type="text" id="os" value={otherSeller} onChange={(e) => setOtherSeller(e.target.value)} placeholder="Name of Third Party" />
                                        </>
                                    }
                                </div>
                            }
                            {(action === 'Internal') &&
                                <div className="inventory--header">
                                    <label className="form__label" htmlFor="source"> Source: </label>
                                    <select id="source" name="source" size="1" value={source} onChange={(e) => setSource(e.target.value)} >
                                        {[<option></option>, <option>CWEFStore</option>, <option>Andheri</option>, <option>Bandra</option>, <option>Powai</option>, <option>Exhibition</option>]}
                                    </select>
                                    <label className="form__label" htmlFor="destination"> Destination: </label>
                                    <select id="destination" name="destination" size="1" value={destination} onChange={(e) => setDestination(e.target.value)} >
                                        {[<option></option>, <option>CWEFStore</option>, <option>Andheri</option>, <option>Bandra</option>, <option>Powai</option>, <option>Exhibition</option>]}
                                    </select>
                                </div>
                            }
                        </div>
                    </form>

                shopHeaderSection =
                    <form>
                        <div className="billing--header">
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
                            <input type="text" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
                        </div>
                        <div className="billing--line2">
                            <label className="form__label" htmlFor="brand">Order Type: </label>
                            <select id="orderType" name="orderType" size="1" value={orderType} onChange={(e) => setOrderType(e.target.value)} >
                                {[<option></option>, <option>Internal</option>, <option>Sale</option>, <option>Exchange</option>]}
                            </select>
                            <input type="text" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                        </div>
                        <div className="billing--line2">
                            <label className="form__label" htmlFor="brand"> Payment Type: </label>
                            <select id="paymentType" name="paymentType" size="1" value={paymentType} onChange={(e) => setPaymentType(e.target.value)} >
                                {[<option></option>, <option>Cash</option>, <option>Card</option>, <option>UPI</option>, <option>Online</option>]}
                            </select>
                            <input type="text" id="membership" placeholder="Membership ID"
                                className={validMember ? "green-back" : "red-back"}
                                value={membership}
                                onChange={(e) => setMembership(e.target.value)}
                            />
                        </div>
                        <br></br>
                    </form>


                newItemSection =
                    <div className={((isAdmin || isShopManager) && store === 'Exhibition') ? "addedit-bill-entry" : "add-bill-entry"} >
                        <form onSubmit={handleSubmit}>
                            <div className="new-sku">
                                <input
                                    type="text"
                                    id="new-sku"
                                    value={newEntry}
                                    onChange={(e) => setNewEntry(e.target.value)}
                                    placeholder="Enter new sku"
                                />

                            </div>
                        </form>
                        {((isAdmin || isShopManager) && store === 'Exhibition') && <label htmlFor="persist" className="form__persist">
                            <input
                                type="checkbox"
                                className="form__checkbox"
                                id="persist"
                                onChange={handleToggleEditPrice}
                                checked={editPrice}
                            />
                            Edit Price
                        </label>}
                        <p>Total: {total}</p>
                        <button disabled={(!validQty || !bill.length || ((isAdInCharge || isBaInCharge || isPoInCharge || (action === 'Billing')) && (!paymentType || !orderType)) || (newMembership && !phone))} onClick={makeBill}>Make Bill</button>

                    </div>

                discountSection =
                    <div className="billing--line2">
                        {((isAdmin || isShopManager) && store === 'Exhibition' && editPrice) && <label htmlFor="persist" className="form__label">
                            Discount Percent: <input type="text" id="discount" value={100 - (factor * 100)} onChange={(e) => setFactor((100 - e.target.value) / 100)} placeholder="Discount Percent" />
                        </label>}
                    </div>


                content = bill.map(entry => { //JSON.stringify(skus)
                    return (
                        <table>
                            <tbody>
                                <tr className="table__row bill--row" >
                                    <td className="table__cell bill__entry">{entry.barcode}</td>
                                    <td className="table__cell bill__entry">{entry.name}</td>
                                    <td className="table__cell bill__entry">{(entry.barcode.length === 11 ? (encoding.colour.find(item => item.IDENTITY === entry.barcode.substr(5, 1).toUpperCase()).COLOUR) : null)}</td>
                                    <td className="table__cell bill__entry">{(entry.barcode.length === 11 ? (encoding.sizes.find(item => item.IDENTITY === entry.barcode.substr(4, 1).toUpperCase()).SIZE) : null)}</td>
                                    <td className="table__cell bill__entry">
                                        <input
                                            className='sku_edit_qty'
                                            id='qty'
                                            type='text'
                                            //placeholder={entry.qty}
                                            value={entry.qty}
                                            onChange={(e) => updateQty(e.target.value, entry.barcode)}
                                        />
                                    </td>
                                    {((isAdmin || isShopManager || isInventoryManager) && editPrice && ((action === 'Billing' && store === 'Exhibition') || (action === 'Inventory' && (source === 'OS' || destination === 'OS'))))
                                        ? <td className="table__cell bill__entry">
                                            <input
                                                className='bill_edit_mrp'
                                                id='qty'
                                                type='text'
                                                value={entry.mrp}
                                                onChange={(e) => updateMrp(e.target.value, entry.barcode)}
                                            />
                                        </td> :
                                        <td className="table__cell bill__entry-center">{entry.mrp}</td>
                                    }
                                    <td className="table__cell bill__entry-center">{entry.mrp * entry.qty * factor}</td>
                                    <td className="table__cell bill__entry-center">
                                        <button className="trash" onClick={() => deleteEntry(entry.barcode)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>

                                </tr>
                            </tbody>
                        </table>

                    )
                })

                searchtableContent = (skuIds?.length && newSearch.length > 3)
                    ? skuIds.map(skuid => { //JSON.stringify(skus)
                        //entities[skuid].Barcode.substr(5, 1)
                        return (

                            <tr className="table__row bill--searchrow" >
                                <td className="table__cell bill__entry">{entities[skuid].barcode}</td>
                                <td className="table__cell bill__entry">{entities[skuid].name}</td>
                                <td className="table__cell bill__entry">{entities[skuid].barcode.length === 11 ? encoding.sizes.find(temp => { return temp.IDENTITY === entities[skuid].barcode.substr(4, 1) }).SIZE : ""}</td>
                                <td className="table__cell bill__entry">{entities[skuid].barcode.length === 11 ? encoding.colour.find(temp => { return temp.IDENTITY === entities[skuid].barcode.substr(5, 1) }).COLOUR : ""}</td>
                            </tr>

                        )
                    })
                    : null
            }
        }
    }



    return (
        <>
            <Popup trigger={popupTrigger} >
                <h3>Scan Membership Card</h3>
                <p>(Phone number is mandatory for Membership purchases)</p>
                <input
                    type="text"
                    id="new-membership"
                    value={newMembership}
                    onChange={(e) => setNewMembership(e.target.value)}
                />
                <button className="close-btn" onClick={() => setPopupTrigger(false)}>Continue</button>
            </Popup>
            <Popup trigger={errorPopup} >
                <h3>ERROR!! - Please report this immediately to the admin (Swapnesh)</h3>
                <p>{updateError}</p>
                <button className="close-btn" onClick={() => setErrorPopup(false)}>Close</button>
            </Popup>
            <h2>{status} Billing: </h2>
            <br></br>
            {(isAdmin || isShopManager || isInventoryManager) && newInvHeaderSection}
            <br></br>
            {(((isAdmin || isShopManager) && action === "Billing") || isAdInCharge || isBaInCharge || isPoInCharge) && shopHeaderSection}
            <br></br>
            {newItemSection}
            {discountSection}
            <br></br>
            <p className={validQty ? "offscreen" : "errmsg"}>{validQty ? '' : 'Quantity Check Failed'}</p>
            {content}
            <br></br>
            <br></br>
            {returnBillSection}
            <br></br>
            <br></br>
            <br></br>
            <div className="new-sku">
                <label className="form__label" htmlFor="source">Search Results: </label>
                <input
                    type="text"
                    id="new-sku"
                    value={newSearch}
                    onChange={(e) => setNewSearch(e.target.value)}
                    placeholder="Search by Name"
                />
            </div>
            <br></br>
            <table>
                <thead className="table__row bill--searchrow">
                    <tr>
                        <th scope="col" className="table__th bill__entry-center">Barcode</th>
                        <th scope="col" className="table__th bill__entry-center">Name</th>
                        <th scope="col" className="table__th bill__entry-center">Size</th>
                        <th scope="col" className="table__th bill__entry-center">Colour</th>
                    </tr>
                </thead>
                <tbody>
                    {searchtableContent}
                </tbody>
            </table>

        </>
    )
}
export default BillList