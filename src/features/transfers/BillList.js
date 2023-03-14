import { useGetSkusQuery } from "../skus/skusApiSlice"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect } from "react"
import { encoding } from "../../data/encoding"
import useAuth from "../../hooks/useAuth";
import { getGst } from "../utilities/GstCalc"

import { useGetBillNosQuery, useUpdateBillNoMutation, categorySelect, finyearNow, pad } from "./billNoApiSlice"
import { useGetLedgerQuery, useAddNewLedgerMutation } from "../ledger/ledgerApiSlice"

import { useGetInventoryQuery, useAddNewInventoryMutation, useUpdateInventoryMutation } from "../inventory/inventoryApiSlice"
import { useGetMembersQuery } from "../membership/membersApiSlice"

import { useAddNewEmailMutation } from "./emailApiSlice"
import ReturnLedger from "./ReturnLedger"

import { useNavigate } from "react-router-dom"

const BillList = () => {
    const [newEntry, setNewEntry] = useState('')
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

    const navigate = useNavigate()

    const { isAdInCharge, isBaInCharge, isPoInCharge, isShopManager, isInventoryManager, isAdmin, status } = useAuth()

    const {
        data: skus,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetSkusQuery('skuList', {
        pollingInterval: 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const {
        data: billnos,
        isLoading: billLoading,
        isSuccess: billSucecss
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
        pollingInterval: 120000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const [addledger, {
        isSuccess: addledgerSuccess
    }] = useAddNewLedgerMutation()

    const {
        data: inventory,
        isLoading: invLoading,
        isSuccess: invGetSucecss
    } = useGetInventoryQuery('inventoryList', {
        pollingInterval: 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const [updateinventory, {
        isSuccess: updateInvSuccess
    }] = useUpdateInventoryMutation()

    const [addinventory, {
        isSuccess: addInvSuccess
    }] = useAddNewInventoryMutation()

    const {
        data: members,
        isSuccess: memberSuccess
    } = useGetMembersQuery('membersList', {
        pollingInterval: 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

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
                if (action === 'Billing' && orderType !== 'Exchange') localSource = store.toLowerCase()
                else if (action === 'Internal') localSource = source.toLowerCase()
                else if (action === 'Inventory' && source === 'CWEFStore') localSource = 'cwefstore'
                else if (action === 'Inventory') localSource = 'source'
            }
            return localSource
        }

        const checkQty = () => {
            const source = identifySource()
            if (invGetSucecss) {

                const { ids: invIds, entities: invEntities } = inventory

                let qtyArr = []
                if (bill.length) {
                    bill.forEach(entry => {
                        let id = invIds.find(temp => invEntities[temp].barcode.toLowerCase() === entry.barcode.toLowerCase())
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

    }, [bill, inventory, action, isAdInCharge, isBaInCharge, isPoInCharge, isAdmin, isInventoryManager, isShopManager, orderType, source, status, store, invGetSucecss])

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
        if (addledgerSuccess && (updateInvSuccess || addInvSuccess)) {
            if (action === 'Billing') navigate(`/dash/shopaccounts/${billNo}`)
            else navigate(`/dash/inventory/${addedSkus}`)
        }
    }, [addledgerSuccess, addInvSuccess, updateInvSuccess, action, navigate, billNo, addedSkus])

    useEffect(() => {

        const checkMembersip = () => {
            if (memberSuccess) {
                const { ids: memberIds, entities: memberEntities } = members

                const mId = memberIds?.filter(id => (
                    memberEntities[id].barcode.toLowerCase() === membership?.toLowerCase() ||
                    memberEntities[id].phone.toLowerCase() === membership?.toLowerCase()
                ))
                if (mId[0]) {
                    const dayspast = (new Date() - new Date(memberEntities[mId].updatedAt)) / 86400000
                    if (dayspast > memberEntities[mId].duration) setValidMember(false)
                    else setValidMember(true)
                } else setValidMember(false)

            }
        }



        checkMembersip()

    }, [membership, memberSuccess, members])

    useEffect(() => {

        const updatePrice = () => {

            if (bill.length) {

                if (isSuccess) {
                    const { ids: skuIds, entities: skuEntities } = skus
                    bill.forEach(entry => {
                        if (!entry.return) {
                            let skuid = skuIds.find(temp => skuEntities[temp].Barcode.toLowerCase() === entry.barcode.toLowerCase())
                            if (validMember) entry.mrp = skuEntities[skuid].MBR
                            else entry.mrp = skuEntities[skuid].MRP
                        }
                    })
                }

            }


        }
        updatePrice()

    }, [bill, isSuccess, skus, validMember])


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
                        myBill = [...bill, { barcode: entry.Barcode, name: entry.Name, qty: (-entry.Return), mrp: ((entry.Price / entry.Qty) * entry.Return), hsn: entry.hsn, gst: entry.gst, return: 1 }]
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
    let content
    let searchtableContent
    let returnBillSection

    if (isLoading) content = <p>Loading...</p>
    if (isError) content = <p className="errmsg">{error?.data?.message}</p>

    if (isSuccess) {

        const { ids, entities } = skus
        let skuIds = ids.filter(sku => (entities[sku].Name.toLowerCase().includes(newSearch.toLowerCase())))

        if (billLoading) content = <p>Loading...</p>

        if (ledgerSuccess && orderType === 'Exchange') {

            const getReturnBill = () => {

                const { ids: ledgerIds, entities: ledgerEntities } = ledger
                let returnBillIds = ledgerIds.filter(ledger => (
                    ledgerEntities[ledger].billno.toLowerCase().includes(returnBillNo.toLowerCase()) && returnBillNo.length === 12   // remove the previous comment before deployment
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
                    //console.log(consolidatedReturn)
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

        if (billSucecss) {

            const { ids: billids, entities: billentities } = billnos
            let myUpdateStr = { id: billids[0], ad: 0, ba: 0, po: 0, ex: 0, db: 0, dn: 0, rs: 0, int: 0, os: 0, ip: 0 }

            if (invLoading) content = <p>Loading...</p>

            if (invGetSucecss) {

                const { ids: invids, entities: inventities } = inventory

                let updateInvStr

                const updateInv = async (tseller, tbuyer, qty) => {

                    const tqty = Number(qty)
                    updateInvStr = { source: 0, cwefstore: 0, andheri: 0, bandra: 0, powai: 0, exhibition: 0, sales: 0 }
                    if (['CH', 'CWEF', 'OS'].includes(tseller)) { updateInvStr.source = -tqty }
                    else if (tseller === 'CWEFStore') { updateInvStr.cwefstore = -tqty }
                    else if (tseller === 'Andheri') { updateInvStr.andheri = -tqty }
                    else if (tseller === 'Bandra') { updateInvStr.bandra = -tqty }
                    else if (tseller === 'Powai') { updateInvStr.powai = -tqty }
                    else if (tseller === 'Exhibition') { updateInvStr.exhibition = -tqty }

                    if (['CH', 'CWEF', 'OS'].includes(tbuyer)) { updateInvStr.source = tqty }
                    else if (tbuyer === 'CWEFStore') { updateInvStr.cwefstore = tqty }
                    else if (tbuyer === 'Andheri') { updateInvStr.andheri = tqty }
                    else if (tbuyer === 'Bandra') { updateInvStr.bandra = tqty }
                    else if (tbuyer === 'Powai') { updateInvStr.powai = tqty }
                    else if (tbuyer === 'Exhibition') { updateInvStr.exhibition = tqty }
                    else { updateInvStr.sales = tqty }

                }

                const getbillno = (seller, buyer) => {

                    if (seller === 'CH' && buyer === 'CWEFStore') { (myUpdateStr.db = 1); return (billentities[billids[0]].db); }
                    if (seller === 'OS' && buyer === 'CWEFStore') { (myUpdateStr.os = 1); return (billentities[billids[0]].os); }
                    if (seller === 'CWEF' && buyer === 'CWEFStore') { (myUpdateStr.ip = 1); return (billentities[billids[0]].ip); }
                    if (seller === 'CWEFStore' && buyer === 'CH') { (myUpdateStr.dn = 1); return (billentities[billids[0]].dn); }
                    if (seller === 'CWEFStore' && buyer === 'OS') { (myUpdateStr.rs = 1); return (billentities[billids[0]].rs); }
                    if ((seller === 'CWEFStore' || seller === 'Andheri' || seller === 'Bandra' || seller === 'Powai' || seller === 'Exhibition')
                        && (buyer === 'CWEFStore' || buyer === 'Andheri' || buyer === 'Bandra' || buyer === 'Powai' || buyer === 'Exhibition')) {
                        (myUpdateStr.int = 1); return (billentities[billids[0]].int);
                    }
                    if (seller === 'Andheri') { (myUpdateStr.ad = 1); return (billentities[billids[0]].ad); }
                    if (seller === 'Bandra') { (myUpdateStr.ba = 1); return (billentities[billids[0]].ba); }
                    if (seller === 'Powai') { (myUpdateStr.po = 1); return (billentities[billids[0]].po); }
                    if (seller === 'Exhibition') { (myUpdateStr.ex = 1); return (billentities[billids[0]].ex); }
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
                        const billdigits = pad(getbillno(sellerCode, buyerCode))
                        mybillno = `CH${categorySelect(sellerCode, buyerCode)}${finyearNow()}-${billdigits}`
                        await updatebillnos(myUpdateStr)
                    } else {
                        mybillno = returnBillNo
                    }
                    setBillNo(mybillno)

                    bill.forEach(entry => {
                        myAddedSkus = myAddedSkus ? (myAddedSkus + '-' + entry.barcode) : entry.barcode
                    })
                    setAddedSkus(myAddedSkus)

                    bill.forEach(async (entry) => {

                        const ledgerEntry = { billno: mybillno, barcode: entry.barcode, name: entry.name, ordertype: myorderType, buyer: (myBuyer ? myBuyer : buyerCode), seller: mySeller, phone: myPhone, email: myEmail, paymenttype: myPaymentType, membership: myMembership, qty: entry.qty, totalprice: (entry.qty * entry.mrp * factor), hsncode: entry.hsn, gst: entry.gst }

                        let canSave = [mybillno, entry.barcode, myorderType, (myBuyer || buyerCode), mySeller, myPaymentType, entry.qty, entry.hsn, entry.gst].every(Boolean)

                        const invId = invids.filter(id => (
                            inventities[id].barcode.toLowerCase() === entry.barcode.toLowerCase()
                        ))

                        if (canSave) {
                            await addledger(ledgerEntry)
                            await updateInv(sellerCode, buyerCode, entry.qty)

                            if (invId[0]) {
                                await updateinventory({ id: invId[0], source: updateInvStr.source, cwefstore: updateInvStr.cwefstore, andheri: updateInvStr.andheri, bandra: updateInvStr.bandra, powai: updateInvStr.powai, exhibition: updateInvStr.exhibition, sales: updateInvStr.sales })
                            } else {
                                await addinventory({ barcode: entry.barcode, name: entry.name, size: entry.size, colour: entry.colour, source: updateInvStr.source, cwefstore: updateInvStr.cwefstore, andheri: updateInvStr.andheri, bandra: updateInvStr.bandra, powai: updateInvStr.powai, exhibition: updateInvStr.exhibition, sales: updateInvStr.sales })
                            }
                        }
                    })

                    //console.log(billHtml)
                    let myemail
                    if ((isAdmin || isInventoryManager || isShopManager) && action === 'Inventory') myemail = 'swapnesh.j@gmail.com'         // send to Accounts, ShopManager, Inventory Manager
                    else if ((isAdmin || isInventoryManager || isShopManager) && action === 'Internal') myemail = 'swapnesh.j@gmail.com'      // send to ShopManager, Inventory Manager
                    else myemail = email // populate email from form
                    if (myemail) {
                        await sendEmail({ recipient: myemail, subject: `${orderType}: Bill No.${mybillno}`, messagebody: bill })
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
                    const index = myBill.findIndex((obj) => obj.barcode === newEntry)


                    if (index !== -1) {
                        myBill[index].qty++
                    }
                    else {
                        let skuId = ids.filter(sku => (entities[sku].Barcode.toLowerCase().includes(newEntry.toLowerCase())))
                        const myMrp = validMember ? entities[skuId[0]].MBR : entities[skuId[0]].MRP
                        const myGst = getGst(entities[skuId[0]].HSNCode, myMrp)
                        //console.log(skuId)
                        if (skuId[0]) {
                            myBill = [...bill, {
                                barcode: entities[skuId[0]].Barcode, name: entities[skuId[0]].Name,
                                colour: (entities[skuId[0]].Barcode.length === 11 ? (encoding.colour.find(item => item.IDENTITY === entities[skuId[0]].Barcode.substr(5, 1).toUpperCase()).COLOUR) : ""),
                                size: (entities[skuId[0]].Barcode.length === 11 ? (encoding.sizes.find(item => item.IDENTITY === entities[skuId[0]].Barcode.substr(4, 1).toUpperCase()).SIZE) : ""),
                                qty: 1, mrp: myMrp, hsn: entities[skuId[0]].HSNCode, gst: myGst, return: 0
                            }]

                        } else {
                            myBill = [...bill, { barcode: 'NA', name: 'NA', mrp: 0, hsn: 'NA', gst: 'NA', return: 0 }]    // This needs to be removed
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
                    setBill(myBill)
                }



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
                                        {[<option></option>, <option>CWEFStore</option>, <option>Andheri</option>, <option>Bandra</option>, <option>Powai</option>]}
                                    </select>
                                    <label className="form__label" htmlFor="destination"> Destination: </label>
                                    <select id="destination" name="destination" size="1" value={destination} onChange={(e) => setDestination(e.target.value)} >
                                        {[<option></option>, <option>CWEFStore</option>, <option>Andheri</option>, <option>Bandra</option>, <option>Powai</option>]}
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
                    <div className="add-bill-entry" >
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
                        <p>Total: {total}</p>
                        <button disabled={!validQty} onClick={makeBill}>Make Bill</button>

                    </div>



                content = bill.map(entry => { //JSON.stringify(skus)
                    return (
                        <table>
                            <tbody>
                                <tr className="table__row bill--row" >
                                    <td className="table__cell bill__entry">{entry.barcode}</td>
                                    <td className="table__cell bill__entry">{entry.name}</td>
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
                                    {((isAdmin || isShopManager || isInventoryManager) && ((action === 'Billing' && store === 'Exhibition') || (action === 'Inventory' && (source === 'OS' || destination === 'OS'))))
                                        ? <td className="table__cell bill__entry">
                                            <input
                                                className='sku_edit_num'
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
                                <td className="table__cell bill__entry">{entities[skuid].Barcode}</td>
                                <td className="table__cell bill__entry">{entities[skuid].Name}</td>
                                <td className="table__cell bill__entry">{entities[skuid].Barcode.length === 11 ? encoding.sizes.find(temp => { return temp.IDENTITY === entities[skuid].Barcode.substr(4, 1) }).SIZE : ""}</td>
                                <td className="table__cell bill__entry">{entities[skuid].Barcode.length === 11 ? encoding.colour.find(temp => { return temp.IDENTITY === entities[skuid].Barcode.substr(5, 1) }).COLOUR : ""}</td>
                            </tr>

                        )
                    })
                    : null
            }
        }
    }

    return (
        <>
            <h2>{status} Billing: </h2>
            <br></br>
            {(isAdmin || isShopManager || isInventoryManager) && newInvHeaderSection}
            <br></br>
            {(((isAdmin || isShopManager) && action === "Billing") || isAdInCharge || isBaInCharge || isPoInCharge) && shopHeaderSection}
            <br></br>
            {newItemSection}
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