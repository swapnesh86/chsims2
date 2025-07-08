import { useGetLedgerQuery } from "./ledgerApiSlice"
import Ledger from "./Ledger"
import SalesSummary from "./SalesSummary"
import HsnSummary from "./HsnSummary"
import GstSummary from "./GstSummary"
import StaffAttendance from "../attendance/StaffAttendance"
import Commission from "./Commission"

import { useState, useEffect } from "react"

import jsPDF from "jspdf";
import "jspdf-autotable";
import FileSaver from "file-saver"

import { useParams } from 'react-router-dom'
import { encoding } from "../../data/encoding"

import { useGetAttendanceQuery } from "../attendance/attendanceApiSlice"
import useAuth from "../../hooks/useAuth";
import { useGetCommissionQuery, useUpdateCommissionMutation } from "./commissionApiSlice"
import { useNavigate } from "react-router-dom"


const LedgerList = () => {

    const { id } = useParams()
    const { isAdmin, isShopManager } = useAuth()
    const navigate = useNavigate()

    const {
        data: ledger,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetLedgerQuery('ledgerList', {
        pollingInterval: 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const {
        data: attendance,
        isSuccess: attendanceSuccess
    } = useGetAttendanceQuery('attendanceList', {
        pollingInterval: 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const {
        data: commission,
        isSuccess: commissionSuccess
    } = useGetCommissionQuery('commissionList', {
        pollingInterval: 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const [updatecommission, {
        isSuccess: updateCommissionSuccess
    }] = useUpdateCommissionMutation()

    const [dateBegin, setDateBegin] = useState((new Date()).setDate(0));
    const [dateEnd, setDateEnd] = useState(new Date());
    const [billNoSearch, setBillNoSearch] = useState('');
    const [customerBill, setCustomerBill] = useState(true);
    const [gstSearch, setGstSearch] = useState('');

    const [ledgerTableContent, setLedgerTableContent] = useState([]);
    const [jsonContent, setJsonContent] = useState([]);
    const [gstTotals, setGstTotals] = useState();

    const [saleTable, setSaleTable] = useState([]);
    const [jsonSalesContent, setJsonSalesContent] = useState([]);
    const [saleTotals, setSaleTotals] = useState({});

    const [hsnTable, setHsnTable] = useState([]);
    const [jsonHsnContent, setJsonHsnContent] = useState([]);

    const [gstTable, setGstTable] = useState([]);
    const [jsonGstContent, setJsonGstContent] = useState([]);

    const [jsonAttendance, setJsonAttendance] = useState([]);
    const [attendanceTable, setAttendanceTable] = useState([]);
    const [shopGirl, setShopGirl] = useState('');

    const [andheri, setAndheri] = useState(false)
    const [bandra, setBandra] = useState(false)
    const [powai, setPowai] = useState(false)
    const [exhibition, setExhibition] = useState(false)
    const [internal, setInternal] = useState(false)
    const [otherSellers, setOtherSellers] = useState(false)
    const [internalProduction, setInternalProduction] = useState(false)
    const [chpurchases, setChPurchases] = useState(false)
    const [chreturns, setChReturns] = useState(false)


    const [three, setThree] = useState(false)
    const [five, setFive] = useState(false)
    const [twelve, setTwelve] = useState(false)
    const [eighteen, setEighteen] = useState(false)

    const [reportType, setReportType] = useState('Ledger')

    const [adlow, setAdLow] = useState(7000)
    const [admid, setAdMid] = useState(13000)
    const [adhigh, setAdHigh] = useState(25000)
    const [balow, setBaLow] = useState(7000)
    const [bamid, setBaMid] = useState(13000)
    const [bahigh, setBaHigh] = useState(25000)
    const [polow, setPoLow] = useState(7000)
    const [pomid, setPoMid] = useState(13000)
    const [pohigh, setPoHigh] = useState(25000)
    const [exlow, setExLow] = useState(15000)
    const [exmid, setExMid] = useState(25000)
    const [exhigh, setExHigh] = useState(45000)
    const [commissionTable, setCommisionTable] = useState([]);

    useEffect(() => {
        if (updateCommissionSuccess) {
            navigate(`/dash/`)
        }
    }, [updateCommissionSuccess, navigate])


    useEffect(() => {
        if (id === 'ledger') setReportType('Ledger')
        if (id.includes('attendance')) {
            const myArray = id.split("-");
            setReportType('Attendance')
            setShopGirl(myArray[1])
        }
    }, [id])


    useEffect(() => {

        if (jsonContent.length) {
            let myGstSummary = [...jsonContent.reduce((r, o) => {
                const key = o.Date + '-' + o.buyer + '-' + o.BillNo + '-' + o.name
                const item = r.get(key) || Object.assign({}, o, {
                    Key: key, Date: o.Date, Customer: o.buyer, BillNo: o.BillNo, Name: o.name,
                    Price: 0, gst: o.gst
                })

                item.Price += o.Price

                return r.set(key, item)

            }, new Map()).values()]

            const myGstTable = myGstSummary?.length && myGstSummary.map(key => {
                //console.log(key.Key)
                return (<GstSummary key={key.Key} gstrow={key} />)
            })

            //console.log(myGstSummary)
            setJsonGstContent(myGstSummary)
            setGstTable(myGstTable)
        }

    }, [jsonContent, dateBegin, dateEnd])


    useEffect(() => {

        if (jsonContent.length) {
            let myHsnSummary = [...jsonContent.reduce((r, o) => {
                const key = o.HSN + '-' + o.gst
                const item = r.get(key) || Object.assign({}, o, {
                    Key: key, description: encoding.hsnDesc.find(entry => entry.hsn === o.HSN).Description,
                    Qty: 0, Price: 0, HSN: o.HSN, gst: o.gst
                })

                item.Qty += o.Qty
                item.Price += o.Price

                return r.set(key, item)

            }, new Map()).values()]

            //console.log('HSN', myHsnSummary)
            const myHsntable = myHsnSummary?.length && myHsnSummary.map(key => {
                return (<HsnSummary key={key.Key} hsnrow={key} />)
            })

            setJsonHsnContent(myHsnSummary)
            setHsnTable(myHsntable)
        }

    }, [jsonContent, dateBegin, dateEnd])


    useEffect(() => {

        let mytotal = {
            adcash: 0, adcard: 0, adupi: 0, adonline: 0, adtotal: 0,
            bacash: 0, bacard: 0, baupi: 0, baonline: 0, batotal: 0,
            pocash: 0, pocard: 0, poupi: 0, poonline: 0, pototal: 0,
            excash: 0, excard: 0, exupi: 0, exonline: 0, extotal: 0,
        }

        if (jsonContent.length) {
            let mysalessummary = [...jsonContent.reduce((r, o) => {
                const key = o.Date
                const item = r.get(key) || Object.assign({}, o, {
                    Key: key, adcash: 0, adcard: 0, adupi: 0, adonline: 0, adtotal: 0,
                    bacash: 0, bacard: 0, baupi: 0, baonline: 0, batotal: 0,
                    pocash: 0, pocard: 0, poupi: 0, poonline: 0, pototal: 0,
                    excash: 0, excard: 0, exupi: 0, exonline: 0, extotal: 0,
                })
                if (o.BillNo.match('CHAD')) {
                    if (o.PaymentType === 'Cash') { item.adcash += o.Price; mytotal.adcash += o.Price; }
                    else if (o.PaymentType === 'Card') { item.adcard += o.Price; mytotal.adcard += o.Price; }
                    else if (o.PaymentType === 'UPI') { item.adupi += o.Price; mytotal.adupi += o.Price; }
                    else if (o.PaymentType === 'Online') { item.adonline += o.Price; mytotal.adonline += o.Price; }
                    item.adtotal += o.Price; mytotal.adtotal += o.Price;
                }
                else if (o.BillNo.match('CHBA')) {
                    if (o.PaymentType === 'Cash') { item.bacash += o.Price; mytotal.bacash += o.Price; }
                    else if (o.PaymentType === 'Card') { item.bacard += o.Price; mytotal.bacard += o.Price; }
                    else if (o.PaymentType === 'UPI') { item.baupi += o.Price; mytotal.baupi += o.Price; }
                    else if (o.PaymentType === 'Online') { item.baonline += o.Price; mytotal.baonline += o.Price; }
                    item.batotal += o.Price; mytotal.batotal += o.Price;
                }
                else if (o.BillNo.match('CHPO')) {
                    if (o.PaymentType === 'Cash') { item.pocash += o.Price; mytotal.pocash += o.Price; }
                    else if (o.PaymentType === 'Card') { item.pocard += o.Price; mytotal.pocard += o.Price; }
                    else if (o.PaymentType === 'UPI') { item.poupi += o.Price; mytotal.poupi += o.Price; }
                    else if (o.PaymentType === 'Online') { item.poonline += o.Price; mytotal.pototal += o.Price; }
                    item.pototal += o.Price; mytotal.pototal += o.Price;
                }
                else if (o.BillNo.match('CHEX')) {
                    if (o.PaymentType === 'Cash') { item.excash += o.Price; mytotal.excash += o.Price; }
                    else if (o.PaymentType === 'Card') { item.excard += o.Price; mytotal.excard += o.Price; }
                    else if (o.PaymentType === 'UPI') { item.exupi += o.Price; mytotal.exupi += o.Price; }
                    else if (o.PaymentType === 'Online') { item.exonline += o.Price; mytotal.extotal += o.Price; }
                    item.extotal += o.Price; mytotal.extotal += o.Price;
                }

                return r.set(key, item)

            }, new Map()).values()]

            setJsonSalesContent([...mysalessummary, mytotal])

            const mytable = mysalessummary?.length && mysalessummary.map(key => {
                return (<SalesSummary key={key.Key} summaryrow={key} />)
            })

            setSaleTable(mytable)
            setSaleTotals(mytotal)
        }

    }, [jsonContent, dateBegin, dateEnd])

    useEffect(() => {

        if (isSuccess) {

            const { ids, entities } = ledger

            let tempD = new Date(dateBegin)
            let tempDate = new Date(tempD.setDate(tempD.getDate() - 1))

            let filteredIds = ids.filter(entry => (
                new Date(entities[entry].createdAt) > tempDate &&
                new Date(entities[entry].createdAt) <= new Date(dateEnd) &&
                ((id === 'ledger' && billNoSearch === '') ? 1 : (id !== 'ledger') ? entities[entry].billno.toLowerCase().match(id.toLowerCase()) : entities[entry].billno.toLowerCase().match(billNoSearch.toLowerCase()))
            )
            )

            if (reportType === 'GST Summary') {
                filteredIds = filteredIds.filter(entry => (
                    (String(entities[entry].gst).match(gstSearch))
                )
                )
            }

            const mytableContent = filteredIds?.length && filteredIds.map(ledgerId => {
                return (<Ledger key={ledgerId} ledgerId={ledgerId} />)
            })
            setLedgerTableContent(mytableContent)

            const myjsonContent = filteredIds?.length && filteredIds.map(ledgerId => ({ Date: (new Intl.DateTimeFormat('en-US').format(new Date(entities[ledgerId].createdAt))), time: (new Date(entities[ledgerId].createdAt)).toLocaleTimeString(), BillNo: entities[ledgerId].billno, Barcode: entities[ledgerId].barcode, Qty: entities[ledgerId].qty, Price: entities[ledgerId].totalprice, HSN: entities[ledgerId].hsncode, PaymentType: entities[ledgerId].paymenttype, gst: entities[ledgerId].gst, buyer: entities[ledgerId].buyer, name: entities[ledgerId].name }))
            setJsonContent(myjsonContent)

        }

    }, [isSuccess, dateBegin, dateEnd, billNoSearch, ledger, id, gstSearch, reportType])

    useEffect(() => {
        if (jsonContent.length) {
            let myGstTotals = [...jsonContent.reduce((r, o) => {
                const key = 'total'
                const item = r.get(key) || Object.assign({}, o, {
                    gst3tot: 0, gst5tot: 0, gst12tot: 0, gst18tot: 0,
                })

                if (o.gst === 3) item.gst3tot += o.Price
                if (o.gst === 5) item.gst5tot += o.Price
                if (o.gst === 12) item.gst12tot += o.Price
                if (o.gst === 18) item.gst18tot += o.Price

                return r.set(key, item)

            }, new Map()).values()]

            setGstTotals(myGstTotals[0])

        }
    }, [jsonContent])

    useEffect(() => {

        if (attendanceSuccess) {

            const { ids, entities } = attendance

            let tempD = new Date(dateBegin)
            let tempDate = new Date(tempD.setDate(tempD.getDate() - 1))

            let filteredIds = ids.filter(entry => (
                new Date(entities[entry].time) > tempDate &&
                new Date(entities[entry].time) <= new Date(dateEnd)
            )
            )

            const attendanceContent = filteredIds?.length && filteredIds.map(id => ({ name: entities[id].name, date: (new Intl.DateTimeFormat('en-US').format(new Date(entities[id].time))), time: (new Date(entities[id].time)).toLocaleTimeString(), in_out: entities[id].in_out, location: entities[id].location }))


            if (attendanceContent.length) {
                let myattendanceReformat = [...attendanceContent.reduce((r, o) => {
                    const key = o.name + '-' + o.date
                    const item = r.get(key) || Object.assign({}, o, {
                        Key: key, name: o.name, date: o.date, location: o.location,
                        in: 0, out: 0
                    })

                    if (o.in_out === 'IN') item.in = o.time
                    if (o.in_out === 'OUT') item.out = o.time

                    return r.set(key, item)

                }, new Map()).values()]

                const myattendancetable = myattendanceReformat?.length && myattendanceReformat.map(key => {
                    if (key.name === shopGirl) {
                        return (<StaffAttendance key={key.Key} entry={key} />)
                    } else return null
                })

                setAttendanceTable(myattendancetable)
                setJsonAttendance(myattendanceReformat)

            }

        }

    }, [attendanceSuccess, dateBegin, dateEnd, attendance, shopGirl])

    useEffect(() => {

        if (jsonAttendance.length && jsonSalesContent.length) {
            let mycommissionData = [...jsonAttendance.reduce((r, o) => {
                const key = o.name
                const item = r.get(key) || Object.assign({}, o, {
                    name: o.name,
                    low: 0, mid: 0, high: 0, tot: 0
                })

                const index = jsonSalesContent.findIndex((obj) => obj.Date === o.date)
                //console.log(jsonSalesContent)

                if (index !== -1) {
                    if (o.location === 'Andheri') {
                        if (jsonSalesContent[index].adtotal > adhigh) { item.high++; item.tot++ }
                        else if (jsonSalesContent[index].adtotal > admid) { item.mid++; item.tot++ }
                        else if (jsonSalesContent[index].adtotal > adlow) { item.low++; item.tot++ }
                    } else if (o.location === 'Bandra') {
                        if (jsonSalesContent[index].batotal > bahigh) { item.high++; item.tot++ }
                        else if (jsonSalesContent[index].batotal > bamid) { item.mid++; item.tot++ }
                        else if (jsonSalesContent[index].batotal > balow) { item.low++; item.tot++ }
                    } else if (o.location === 'Powai') {
                        if (jsonSalesContent[index].pototal > pohigh) { item.high++; item.tot++ }
                        else if (jsonSalesContent[index].pototal > pomid) { item.mid++; item.tot++ }
                        else if (jsonSalesContent[index].pototal > polow) { item.low++; item.tot++ }
                    } else if (o.location === 'Exhibition') {
                        if (jsonSalesContent[index].extotal > exhigh) { item.high++; item.tot++ }
                        else if (jsonSalesContent[index].extotal > exmid) { item.mid++; item.tot++ }
                        else if (jsonSalesContent[index].extotal > exlow) { item.low++; item.tot++ }
                    }
                }
                return r.set(key, item)

            }, new Map()).values()]

            const mycommissiontable = mycommissionData?.length && mycommissionData.map(key => {
                return (<Commission key={key.name} entry={key} />)
            })
            setCommisionTable(mycommissiontable)
            //console.log(mycommissionData)

        }



    }, [jsonAttendance, jsonSalesContent, adhigh, admid, adlow, bahigh, bamid, balow, pohigh, pomid, polow, exlow, exmid, exhigh])


    useEffect(() => {
        let tempstr = ''
        if (andheri) tempstr = 'CHAD'
        if (bandra) tempstr = tempstr + (tempstr !== '' ? '|CHBA' : 'CHBA')
        if (powai) tempstr = tempstr + (tempstr !== '' ? '|CHPO' : 'CHPO')
        if (exhibition) tempstr = tempstr + (tempstr !== '' ? '|CHEX' : 'CHEX')
        if (chpurchases) tempstr = tempstr + (tempstr !== '' ? '|CHDB' : 'CHDB')
        if (chreturns) tempstr = tempstr + (tempstr !== '' ? '|CHDN' : 'CHDN')
        if (otherSellers) tempstr = tempstr + (tempstr !== '' ? '|CHOS' : 'CHOS')
        if (internalProduction) tempstr = tempstr + (tempstr !== '' ? '|CHIP' : 'CHIP')
        if (internal) tempstr = tempstr + (tempstr !== '' ? '|CHIN' : 'CHIN')

        setBillNoSearch(tempstr)

    }, [andheri, bandra, powai, exhibition, chpurchases, chreturns, otherSellers, internalProduction, internal])

    useEffect(() => {
        let tempstr = ''
        if (three) tempstr = tempstr + '3'
        if (five) tempstr = tempstr + (tempstr !== '' ? '|5' : '5')
        if (twelve) tempstr = tempstr + (tempstr !== '' ? '|12' : '12')
        if (eighteen) tempstr = tempstr + (tempstr !== '' ? '|18' : '18')

        setGstSearch(tempstr)

    }, [three, five, twelve, eighteen])

    useEffect(() => {
        if (commissionSuccess) {
            const { ids, entities } = commission
            setAdHigh(entities[ids[0]].adhigh)
            setAdMid(entities[ids[0]].admid)
            setAdLow(entities[ids[0]].adlow)
            setBaHigh(entities[ids[0]].bahigh)
            setBaMid(entities[ids[0]].bamid)
            setBaLow(entities[ids[0]].balow)
            setPoHigh(entities[ids[0]].pohigh)
            setPoMid(entities[ids[0]].pomid)
            setPoLow(entities[ids[0]].polow)
            setExHigh(entities[ids[0]].exhigh)
            setExMid(entities[ids[0]].exmid)
            setExLow(entities[ids[0]].exlow)
        }
    }, [commission, commissionSuccess])

    const exportExcel = () => {
        import("xlsx").then((xlsx) => {
            let content
            if (reportType === 'Ledger') { content = jsonContent; }
            else if (reportType === 'Sales Summary') {
                let mycontent = jsonSalesContent.map((entry) => {
                    return ({
                        Date: entry.Date, AdCash: entry.adcash, AdCard: entry.adcard, AdUPI: entry.adupi, AdOnline: entry.adonline,
                        BaCash: entry.bacash, BaCard: entry.bacard, BaUPI: entry.baupi, BaOnline: entry.baonline,
                        PoCash: entry.pocash, PoCard: entry.pocard, PoUPI: entry.poupi, PoOnline: entry.poonline,
                        ExCash: entry.excash, ExCard: entry.excard, ExUPI: entry.exupi, ExOnline: entry.exonline,
                    })
                })
                content = mycontent;
            }
            else if (reportType === 'HSN Report') {
                let mycontent = jsonHsnContent.map((entry) => {
                    return ({
                        HSN: entry.HSN, GST: entry.gst, Description: entry.description, Quantity: entry.Qty, Price: entry.Price, Taxable: (entry.Price / (1 + entry.gst / 100)).toFixed(2), CGST: (entry.Price * entry.gst * 0.5 / (100 + entry.gst)).toFixed(2), SGST: (entry.Price * entry.gst * 0.5 / (100 + entry.gst)).toFixed(2)
                    })
                })
                content = mycontent;
            }
            else if (reportType === 'GST Summary') {
                let mycontent = jsonGstContent.map((entry) => {
                    return ({
                        Date: entry.Date, GST: entry.gst, Customer: entry.Customer, BillNo: entry.BillNo, Product: entry.name, Taxable: (entry.Price / (1 + entry.gst / 100)).toFixed(2), CGST: (entry.Price * entry.gst * 0.5 / (100 + entry.gst)).toFixed(2), SGST: (entry.Price * entry.gst * 0.5 / (100 + entry.gst)).toFixed(2), Price: entry.Price
                    })
                })
                content = mycontent;
            }

            const workSheet = xlsx.utils.json_to_sheet(content);
            const workBook = { Sheets: { data: workSheet }, SheetNames: ["data"] };
            const excelBuffer = xlsx.write(workBook, {
                bookType: "xlsx",
                type: "array",
            });
            saveAsExcelFile(excelBuffer, "CHLedger");
        });
    };

    const saveAsExcelFile = (buffer, fileName) => {

        let EXCEL_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        let EXCEL_EXTENSION = ".xlsx";
        const data = new Blob([buffer], {
            type: EXCEL_TYPE,
        });
        FileSaver.saveAs(
            data,
            fileName + new Date().getTime() + EXCEL_EXTENSION
        );

    };

    const exportPDF = () => {

        const marginLeft = 4;
        let doc
        let topcontent
        let content
        const chregaddress = "D1, Achanak Colony,\nMahakali Caves Road,\nAndheri East, Mumbai 400 093."
        const chaddress = "D.P. Road No. 11, MIDC,\nOff Mahakali Caves Road,\nAndheri East, Mumbai 400 093.\nPh: 2832 4692 / 2837 3096\njohnyjoseph@creativehandicrafts.org"
        const chgst = "27AAATC0086C1Z7"
        const cwefaddress = "D.P. Road No. 11, MIDC,\nOff Mahakali Caves Road,\nAndheri East, Mumbai 400 093.\n"
        const cwefgst = "27AAICC4194N1Z2"

        let sidemargin = 30

        if (reportType === 'Ledger') {
            if (!customerBill) {
                doc = new jsPDF('portrait', 'pt', 'A4');
                doc.setFontSize(9);
                const tempArr = [andheri, bandra, powai, internal, chpurchases, chreturns, otherSellers, internalProduction]
                const count = tempArr.filter(Boolean).length
                let headstr = "NA"
                let billtype = "NA"
                let sellerRegaddr = "NA"
                let sellerAddr = "NA"
                let sellerGst = "NA"
                let buyerAddr = "NA"
                let buyerGst = "NA"
                if (count === 1) {
                    if (chpurchases) {
                        headstr = "Creative Handicrafts"; billtype = "TAX INVOICE: CH to CWEF"; sellerRegaddr = chregaddress;
                        sellerAddr = chaddress; buyerAddr = cwefaddress; sellerGst = chgst; buyerGst = cwefgst;
                    }
                    else if (chreturns) {
                        headstr = "Creative Women's Empowerment Foundation"; billtype = "Debit Note: CWEF to CH"; sellerRegaddr = cwefaddress; sellerAddr = cwefaddress;
                        buyerAddr = chaddress; sellerGst = cwefgst; buyerGst = chgst;
                    }
                    topcontent = {
                        startY: 30,
                        head: [
                            [{ content: headstr, colSpan: 3, styles: { halign: 'center' } }],
                            [{ content: `GSTIN: ${sellerGst}`, colSpan: 3, styles: { halign: 'center', fillColor: [255, 255, 255], textColor: [0, 0, 0] } }],
                            [{ content: billtype, colSpan: 3, styles: { halign: 'center', fillColor: [255, 255, 255], textColor: [0, 0, 0] } }],
                            ["Registered Address", "Correspondence Address", "Bill to Party"]
                        ],
                        body: [
                            [sellerRegaddr, sellerAddr, `${buyerAddr}\nGSTIN: ${buyerGst}`]
                        ],
                        margin: { top: 10, right: sidemargin, bottom: 0, left: sidemargin },
                        styles: { fontSize: 9 },
                        headStyles: { lineWidth: 0.2, lineColor: [73, 138, 159] },
                    };
                }

                content = {
                    startY: 190,
                    head: [["Date", "BillNo", "Barcode", "Name", "HSN", "Rate", "Qty", "GST", "Taxable", "CGST", "SGST", "Price",]],
                    body: jsonContent.map(entry => [entry.Date, entry.BillNo, entry.Barcode, entry.name, entry.HSN, (entry.Price / entry.Qty), entry.Qty, entry.gst, (entry.Price / (1 + entry.gst / 100)).toFixed(2), (entry.Price * entry.gst * 0.5 / (100 + entry.gst)).toFixed(2), (entry.Price * entry.gst * 0.5 / (100 + entry.gst)).toFixed(2), entry.Price]),
                    foot: [
                        [{ content: "Total @3", colSpan: 8 }, { content: (gstTotals.gst3tot / 1.03).toFixed(2) }, { content: (gstTotals.gst3tot * 0.015 / 1.03).toFixed(2) }, { content: (gstTotals.gst3tot * 0.015 / 1.03).toFixed(2) }, { content: gstTotals.gst3tot }],
                        [{ content: "Total @5", colSpan: 8 }, { content: (gstTotals.gst5tot / 1.05).toFixed(2) }, { content: (gstTotals.gst5tot * 0.025 / 1.05).toFixed(2) }, { content: (gstTotals.gst5tot * 0.025 / 1.05).toFixed(2) }, { content: gstTotals.gst5tot }],
                        [{ content: "Total @12", colSpan: 8 }, { content: (gstTotals.gst12tot / 1.12).toFixed(2) }, { content: (gstTotals.gst12tot * 0.06 / 1.12).toFixed(2) }, { content: (gstTotals.gst12tot * 0.06 / 1.12).toFixed(2) }, { content: gstTotals.gst12tot }],
                        [{ content: "Total @18", colSpan: 8 }, { content: (gstTotals.gst18tot / 1.18).toFixed(2) }, { content: (gstTotals.gst18tot * 0.09 / 1.18).toFixed(2) }, { content: (gstTotals.gst18tot * 0.09 / 1.18).toFixed(2) }, { content: gstTotals.gst18tot }],
                        [{ content: "Total", colSpan: 8 },
                        { content: ((gstTotals.gst18tot / 1.18) + (gstTotals.gst3tot / 1.03) + (gstTotals.gst5tot / 1.05) + (gstTotals.gst12tot / 1.12)).toFixed(2) },
                        { content: ((gstTotals.gst18tot * 0.09 / 1.18) + (gstTotals.gst3tot * 0.015 / 1.03) + (gstTotals.gst5tot * 0.025 / 1.05) + (gstTotals.gst12tot * 0.06 / 1.12)).toFixed(2) },
                        { content: ((gstTotals.gst18tot * 0.09 / 1.18) + (gstTotals.gst3tot * 0.015 / 1.03) + (gstTotals.gst5tot * 0.025 / 1.05) + (gstTotals.gst12tot * 0.06 / 1.12)).toFixed(2) },
                        { content: (gstTotals.gst18tot + gstTotals.gst3tot + gstTotals.gst5tot + gstTotals.gst12tot) }],
                    ],
                    margin: { top: 10, right: sidemargin, bottom: 0, left: sidemargin },
                    styles: { fontSize: 9, fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [125, 125, 125] },
                    //bodyStyles: { lineWidth: 0.2, lineColor: [73, 138, 159] },
                    showFoot: "lastPage",
                };
            } else {
                let billlength = (jsonContent.length * 13 + 150)
                doc = new jsPDF('p', 'mm', [billlength, 95]);
                doc.setFillColor(255, 255, 255);
                let sidemargin = 4
                topcontent = {
                    startY: 6,
                    head: [[{ content: "Creative Womens Empowerment Foundation", colSpan: 2, styles: { halign: 'center', } }]],
                    body: [["Date: ", jsonContent[0].Date], ["Time: ", jsonContent[0].time], ["Customer: ", jsonContent[0].buyer], ["Bill No.: ", jsonContent[0].BillNo]],
                    margin: { top: 10, right: sidemargin, bottom: 0, left: sidemargin },
                    styles: { fontSize: 16, fontStyle: 'bold', fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [0, 0, 0] },
                    theme: 'grid'
                };
                let total = 0
                jsonContent.forEach(item => { total += item.Price })
                content = {
                    startY: 70,
                    head: [["Name", "Qty", "Price"]],
                    body: jsonContent.map(entry => [entry.name, entry.Qty, entry.Price]),
                    foot: [
                        [{ content: "GST", colSpan: 2 }, { content: ((gstTotals.gst18tot * 0.18) / 1.18 + (gstTotals.gst3tot * 0.03) / 1.03 + (gstTotals.gst5tot * 0.05) / 1.05 + (gstTotals.gst12tot * 0.12) / 1.12).toFixed(2) }],
                        [{ content: "Total", colSpan: 2 }, { content: total }]
                    ],
                    margin: { top: 10, right: sidemargin, bottom: 0, left: sidemargin },
                    styles: { fontSize: 16, fontStyle: 'bold', fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [0, 0, 0] },
                    theme: 'grid'
                };
                doc.setFontSize(16);
                doc.text("GST#: 27AAICC4194N1Z2", marginLeft, billlength - 28);
                doc.text("Conditions:", marginLeft, billlength - 20);
                doc.text("  1. Non-Refundable", marginLeft, billlength - 14);
                doc.text("  2. Exchange only within 7 days", marginLeft, billlength - 8);

            }
        } else if (reportType === 'Sales Summary') {
            doc = new jsPDF('landscape', 'pt', 'A4');
            content = {
                startY: 70,
                head: [
                    [{ content: "" }, { content: "Andheri", colSpan: 5 }, { content: "Bandra", colSpan: 5 }, { content: "Powai", colSpan: 5 }, { content: "Exhibition", colSpan: 5 }],
                    ["Date", "Card", "Cash", "UPI", "Online", "Total",
                        "Card", "Cash", "UPI", "Online", "Total",
                        "Card", "Cash", "UPI", "Online", "Total",
                        "Card", "Cash", "UPI", "Online", "Total",
                    ]
                ],
                body: jsonSalesContent.map(entry => [entry.Date, entry.adcard, entry.adcash, entry.adupi, entry.adonline, entry.adtotal,
                entry.bacard, entry.bacash, entry.baupi, entry.baonline, entry.batotal,
                entry.pocard, entry.pocash, entry.poupi, entry.poonline, entry.pototal,
                entry.excard, entry.excash, entry.exupi, entry.exonline, entry.extotal,
                ]),
                margin: { top: 10, right: sidemargin, bottom: 0, left: sidemargin },
                styles: { fontSize: 9 },
                bodyStyles: { lineWidth: 0.2, lineColor: [73, 138, 159] },
            };
        } else if (reportType === 'HSN Report') {
            let headers = [["HSN", "GST", "Description", "Quantity", "Price", "Taxable", "CGST", "SGST"
            ]]
            let data = jsonHsnContent.map(entry => [entry.HSN, entry.gst, entry.description, entry.Qty, entry.Price, (entry.Price / (1 + entry.gst / 100)).toFixed(2),
            (entry.Price * entry.gst * 0.5 / (100 + entry.gst)).toFixed(2), (entry.Price * entry.gst * 0.5 / (100 + entry.gst)).toFixed(2)
            ])
            doc = new jsPDF('portrait', 'pt', 'A4');
            doc.setFontSize(11);
            content = {
                startY: 70, head: headers, body: data,
                margin: { top: 10, right: sidemargin, bottom: 0, left: sidemargin },
                styles: { fontSize: 11 },
                bodyStyles: { lineWidth: 0.2, lineColor: [73, 138, 159] },
            };
        } else if (reportType === 'GST Summary') {
            let headers = [["Date", "GST", "Customer", "Bill No.", "Product", "Taxable", "CGST", "SGST", "Price"
            ]]
            let data = jsonGstContent.map(entry => [entry.Date, entry.gst, entry.Customer, entry.BillNo, entry.name, (entry.Price / (1 + entry.gst / 100)).toFixed(2),
            (entry.Price * entry.gst * 0.5 / (100 + entry.gst)).toFixed(2), (entry.Price * entry.gst * 0.5 / (100 + entry.gst)).toFixed(2), entry.Price
            ])
            doc = new jsPDF('portrait', 'pt', 'A4');
            doc.setFontSize(11);
            content = {
                startY: 70, head: headers, body: data,
                margin: { top: 10, right: sidemargin, bottom: 0, left: sidemargin },
                styles: { fontSize: 11 },
                bodyStyles: { lineWidth: 0.2, lineColor: [73, 138, 159] },
            };
        }

        if (topcontent) doc.autoTable(topcontent);
        doc.autoTable(content);
        doc.save("report.pdf")

    };

    const updateCommissionTargets = async () => {
        if (commissionSuccess) {
            const { ids } = commission
            await updatecommission({ id: ids[0], adlow, admid, adhigh, balow, bamid, bahigh, polow, pomid, pohigh, exlow, exmid, exhigh })
        }

    }

    const handleToggleAndheri = () => setAndheri(prev => !prev)
    const handleToggleBandra = () => setBandra(prev => !prev)
    const handleTogglePowai = () => setPowai(prev => !prev)
    const handleToggleExhibition = () => setExhibition(prev => !prev)
    const handleToggleOtherSellers = () => setOtherSellers(prev => !prev)
    const handleToggleChPurchases = () => setChPurchases(prev => !prev)
    const handleToggleChReturns = () => setChReturns(prev => !prev)
    const handleToggleInternal = () => setInternal(prev => !prev)
    const handleToggleInternalProduction = () => setInternalProduction(prev => !prev)
    const handleToggleThree = () => setThree(prev => !prev)
    const handleToggleFive = () => setFive(prev => !prev)
    const handleToggleTwelve = () => setTwelve(prev => !prev)
    const handleToggleEighteen = () => setEighteen(prev => !prev)

    const handleToggleCustomerBill = () => setCustomerBill(prev => !prev)

    let ledgerContent
    let salesSummary
    let hsnSummary
    let gstSummary
    let attendanceContent
    let commissionContent
    if (isLoading) ledgerContent = <p>Loading...</p>
    if (isError) ledgerContent = <p className="errmsg">{error?.data?.message}</p>

    let dateSelector = (
        <>
            <br></br>
            <div className="ledger--header">
                <p>Begin Date: </p>
                <input type="date" onChange={e => setDateBegin(e.target.value)} />
                <p>End Date: </p>
                <input type="date" onChange={e => setDateEnd(e.target.value)} />
            </div>
            {(reportType !== 'Attendance' && reportType !== 'Commission') &&
                <div className="ledger--header">


                    <button onClick={exportExcel}>GenExcel</button>
                    <button onClick={exportPDF}>GenPdf</button>


                </div>
            }
            <br></br>
        </>
    )

    if (attendanceSuccess) {
        attendanceContent = (
            <>
                <label className="form__label" htmlFor="report"> Shop Girl : </label>
                <select id="staff" name="staff" size="1" value={shopGirl} onChange={(e) => setShopGirl(e.target.value)} >
                    {[<option key="Ankita" value="Ankita">Ankita</option>,
                    <option key="Aditi" value="Aditi">Aditi</option>,
                    <option key="Poonam" value="Poonam">Poonam</option>,
                    <option key="Kirti" value="Kirti">Kirti</option>,
                    <option key="Sanika" value="Sanika">Sanika</option>,
                    <option key="Sanchi" value="Sanchi">Sanchi</option>,
                    <option key="Neha" value="Neha">Neha</option>]}
                </select>
                <br></br>
                <br></br>
                <table >
                    <thead className="table__thead--staff--attendance">
                        <tr>
                            <th scope="col" className="table__th ledger__ledgername">Date</th>
                            <th scope="col" className="table__th ledger__ledgername">Location</th>
                            <th scope="col" className="table__th ledger__ledgername">Time In</th>
                            <th scope="col" className="table__th ledger__ledgername">Time Out</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceTable}
                    </tbody>
                </table>
            </>
        )

        commissionContent = (
            <>

                {(isAdmin || isShopManager) &&
                    <>
                        <table className="table--commission--values">
                            <thead className="table__thead">
                                <tr>
                                    <th scope="col" className="table__th ledger__ledgername">Location</th>
                                    <th scope="col" className="table__th ledger__ledgername">Low</th>
                                    <th scope="col" className="table__th ledger__ledgername">Medium</th>
                                    <th scope="col" className="table__th ledger__ledgername">High</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="table__row user" >
                                    <td className="table__cell sku__primary">Andheri</td>
                                    <td className="table__cell sku__primary">
                                        <input className='sku_edit_location' type='text' value={adlow} onChange={(e) => setAdLow(e.target.value)} />
                                    </td>
                                    <td className="table__cell sku__primary">
                                        <input className='sku_edit_location' type='text' value={admid} onChange={(e) => setAdMid(e.target.value)} />
                                    </td>
                                    <td className="table__cell sku__primary">
                                        <input className='sku_edit_location' type='text' value={adhigh} onChange={(e) => setAdHigh(e.target.value)} />
                                    </td>
                                </tr>
                                <tr className="table__row user" >
                                    <td className="table__cell sku__primary">Bandra</td>
                                    <td className="table__cell sku__primary">
                                        <input className='sku_edit_location' type='text' value={balow} onChange={(e) => setBaLow(e.target.value)} />
                                    </td>
                                    <td className="table__cell sku__primary">
                                        <input className='sku_edit_location' type='text' value={bamid} onChange={(e) => setBaMid(e.target.value)} />
                                    </td>
                                    <td className="table__cell sku__primary">
                                        <input className='sku_edit_location' type='text' value={bahigh} onChange={(e) => setBaHigh(e.target.value)} />
                                    </td>
                                </tr>
                                <tr className="table__row user" >
                                    <td className="table__cell sku__primary">Powai</td>
                                    <td className="table__cell sku__primary">
                                        <input className='sku_edit_location' type='text' value={polow} onChange={(e) => setPoLow(e.target.value)} />
                                    </td>
                                    <td className="table__cell sku__primary">
                                        <input className='sku_edit_location' type='text' value={pomid} onChange={(e) => setPoMid(e.target.value)} />
                                    </td>
                                    <td className="table__cell sku__primary">
                                        <input className='sku_edit_location' type='text' value={pohigh} onChange={(e) => setPoHigh(e.target.value)} />
                                    </td>
                                </tr>
                                <tr className="table__row user" >
                                    <td className="table__cell sku__primary">Exhibition</td>
                                    <td className="table__cell sku__primary">
                                        <input className='sku_edit_location' type='text' value={exlow} onChange={(e) => setExLow(e.target.value)} />
                                    </td>
                                    <td className="table__cell sku__primary">
                                        <input className='sku_edit_location' type='text' value={exmid} onChange={(e) => setExMid(e.target.value)} />
                                    </td>
                                    <td className="table__cell sku__primary">
                                        <input className='sku_edit_location' type='text' value={exhigh} onChange={(e) => setExHigh(e.target.value)} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <br></br>
                        <button onClick={updateCommissionTargets}>Update Commission Targets</button>
                        <br></br>
                    </>
                }

                <br></br>
                <table className="table--commission--table">
                    <thead className="table__thead">
                        <tr>
                            <th scope="col" className="table__th ledger__ledgername">Name</th>
                            <th scope="col" className="table__th ledger__ledgername">Low</th>
                            <th scope="col" className="table__th ledger__ledgername">Medium</th>
                            <th scope="col" className="table__th ledger__ledgername">High</th>
                            <th scope="col" className="table__th ledger__ledgername">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commissionTable}
                    </tbody>
                </table>
            </>
        )

    }


    if (isSuccess) {

        gstSummary = (
            <>
                <div className="ledger--selector">
                    <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggleThree}
                            checked={three}
                        />
                        3
                    </label>
                    <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggleFive}
                            checked={five}
                        />
                        5
                    </label>
                    <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggleTwelve}
                            checked={twelve}
                        />
                        12
                    </label>
                    <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggleEighteen}
                            checked={eighteen}
                        />
                        18
                    </label>
                </div>
                <br></br>
                <table >
                    <thead className="table__thead--gst">
                        <tr>
                            <th scope="col" className="table__th ledger__ledgername">Date</th>
                            <th scope="col" className="table__th ledger__ledgername">GST</th>
                            <th scope="col" className="table__th ledger__ledgername">Customer</th>
                            <th scope="col" className="table__th ledger__ledgername">BillNo</th>
                            <th scope="col" className="table__th ledger__ledgername">Product</th>
                            <th scope="col" className="table__th ledger__ledgername">Taxable</th>
                            <th scope="col" className="table__th ledger__ledgername">CGST</th>
                            <th scope="col" className="table__th ledger__ledgername">SGST</th>
                            <th scope="col" className="table__th ledger__ledgername">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gstTable}
                    </tbody>
                </table>
            </>
        )

        hsnSummary = (
            <>
                <table >
                    <thead className="table__thead--hsn">
                        <tr>
                            <th scope="col" className="table__th ledger__ledgername">HSN</th>
                            <th scope="col" className="table__th ledger__ledgername">GST</th>
                            <th scope="col" className="table__th ledger__ledgername">Description</th>
                            <th scope="col" className="table__th ledger__ledgername">Quantity</th>
                            <th scope="col" className="table__th ledger__ledgername">Price</th>
                            <th scope="col" className="table__th ledger__ledgername">Taxable</th>
                            <th scope="col" className="table__th ledger__ledgername">CGST</th>
                            <th scope="col" className="table__th ledger__ledgername">SGST</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hsnTable}
                    </tbody>
                </table>
            </>
        )

        salesSummary = (
            <>
                <table >
                    <thead className="table__thead--summarytop">
                        <tr>
                            <th scope="col" className="table__th ledger__ledgername"></th>
                            <th scope="col" className="table__th ledger__ledgername">Andheri</th>
                            <th scope="col" className="table__th ledger__ledgername">Bandra</th>
                            <th scope="col" className="table__th ledger__ledgername">Powai</th>
                            <th scope="col" className="table__th ledger__ledgername">Exhibition</th>
                        </tr>
                    </thead>
                    <thead className="table__thead--summarysecond">
                        <tr>
                            <th scope="col" className="table__th ledger__ledgername">Date</th>
                            <th scope="col" className="table__th ledger__ledgername">Cash</th>
                            <th scope="col" className="table__th ledger__ledgername">Card</th>
                            <th scope="col" className="table__th ledger__ledgername">UPI</th>
                            <th scope="col" className="table__th ledger__ledgername">Online</th>
                            <th scope="col" className="table__th ledger__ledgername">Total</th>
                            <th scope="col" className="table__th ledger__ledgername">Cash</th>
                            <th scope="col" className="table__th ledger__ledgername">Card</th>
                            <th scope="col" className="table__th ledger__ledgername">UPI</th>
                            <th scope="col" className="table__th ledger__ledgername">Online</th>
                            <th scope="col" className="table__th ledger__ledgername">Total</th>
                            <th scope="col" className="table__th ledger__ledgername">Cash</th>
                            <th scope="col" className="table__th ledger__ledgername">Card</th>
                            <th scope="col" className="table__th ledger__ledgername">UPI</th>
                            <th scope="col" className="table__th ledger__ledgername">Online</th>
                            <th scope="col" className="table__th ledger__ledgername">Total</th>
                            <th scope="col" className="table__th ledger__ledgername">Cash</th>
                            <th scope="col" className="table__th ledger__ledgername">Card</th>
                            <th scope="col" className="table__th ledger__ledgername">UPI</th>
                            <th scope="col" className="table__th ledger__ledgername">Online</th>
                            <th scope="col" className="table__th ledger__ledgername">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {saleTable}
                    </tbody>
                    <thead className="table__thead--summarysecond">
                        <tr>
                            <th scope="col" className="table__th ledger__ledgername">Total</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.adcash}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.adcard}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.adupi}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.adonline}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.adtotal}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.bacash}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.bacard}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.baupi}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.baonline}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.batotal}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.pocash}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.pocard}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.poupi}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.poonline}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.pototal}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.excash}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.excard}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.exupi}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.exonline}</th>
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.extotal}</th>

                        </tr>
                    </thead>
                </table>
            </>
        )

        ledgerContent = (
            <>
                <div className="ledger--selector">
                    <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggleAndheri}
                            checked={andheri}
                        />
                        Andheri
                    </label>
                    <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggleBandra}
                            checked={bandra}
                        />
                        Bandra
                    </label>
                    <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleTogglePowai}
                            checked={powai}
                        />
                        Powai
                    </label>
                    <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggleExhibition}
                            checked={exhibition}
                        />
                        Exhibition
                    </label>
                    <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggleInternal}
                            checked={internal}
                        />
                        Internal
                    </label>
                    <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggleChPurchases}
                            checked={chpurchases}
                        />
                        CH Purchases
                    </label>
                    <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggleChReturns}
                            checked={chreturns}
                        />
                        CH Returns
                    </label>
                    <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggleOtherSellers}
                            checked={otherSellers}
                        />
                        Other Sellers
                    </label>
                    <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggleInternalProduction}
                            checked={internalProduction}
                        />
                        Internal Production
                    </label>

                </div>
                <br></br>
                <p>Search: </p>
                <input type="text" placeholder="Bill Number" onChange={e => setBillNoSearch(e.target.value)} />
                <br></br>
                <br></br>
                <label htmlFor="persist" className="form__persist">
                    <input
                        type="checkbox"
                        className="form__checkbox"
                        id="persist"
                        onChange={handleToggleCustomerBill}
                        checked={customerBill}
                    />
                    Customer Bill
                </label>
                <br></br>
                <table >
                    <thead className="table__thead--ledger">
                        <tr>
                            <th scope="col" className="table__th ledger__ledgername">Date</th>
                            <th scope="col" className="table__th ledger__ledgername">Billno</th>
                            <th scope="col" className="table__th ledger__ledgername">Barcode</th>
                            <th scope="col" className="table__th ledger__ledgername">Name</th>
                            <th scope="col" className="table__th ledger__ledgername">OrderType</th>
                            <th scope="col" className="table__th ledger__ledgername">Buyer</th>
                            <th scope="col" className="table__th ledger__ledgername">Payment Type</th>
                            <th scope="col" className="table__th ledger__ledgername">Qty</th>
                            <th scope="col" className="table__th ledger__ledgername">Total Price</th>
                            <th scope="col" className="table__th ledger__ledgername">HsnCode</th>
                            <th scope="col" className="table__th ledger__ledgername">GST</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ledgerTableContent}
                    </tbody>
                </table>
            </>
        )
    }

    return (
        <>
            <label className="form__label" htmlFor="report"> Select Report : </label>
            <select id="report" name="report" size="1" value={reportType} onChange={(e) => setReportType(e.target.value)} >
                {[<option key="Ledger" value="Ledger" >Ledger</option>,
                <option key="Sales Summary" value="Sales Summary" >Sales Summary</option>,
                <option key="HSN Report" value="HSN Report" >HSN Report</option>,
                <option key="GST Summary" value="GST Summary" >GST Summary</option>,
                <option key="Attendance" value="Attendance" >Attendance</option>,
                <option key="Commission" value="Commission" >Commission</option>
                ]}
            </select>
            <br></br>
            {dateSelector}
            {(reportType === 'Ledger') && ledgerContent}
            {(reportType === 'Sales Summary') && salesSummary}
            {(reportType === 'HSN Report') && hsnSummary}
            {(reportType === 'GST Summary') && gstSummary}
            {(reportType === 'Attendance') && attendanceContent}
            {(reportType === 'Commission') && commissionContent}

        </>
    )

}

export default LedgerList
