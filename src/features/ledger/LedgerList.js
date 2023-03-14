import { useGetLedgerQuery } from "./ledgerApiSlice"
import { useGetSkusQuery } from "../skus/skusApiSlice"
import Ledger from "./Ledger"
import SalesSummary from "./SalesSummary"
import HsnSummary from "./HsnSummary"
import GstSummary from "./GstSummary"
import StaffAttendance from "../attendance/StaffAttendance"

import { useState, useEffect } from "react"

import jsPDF from "jspdf";
import "jspdf-autotable";
import FileSaver from "file-saver"

import { useParams } from 'react-router-dom'
import { encoding } from "../../data/encoding"

import { useGetAttendanceQuery } from "../attendance/attendanceApiSlice"


const LedgerList = () => {

    const { id } = useParams()

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
        data: skus,
        isSuccess: skuSuccess
    } = useGetSkusQuery('skuList', {
        pollingInterval: 120000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const {
        data: attendance,
        isSuccess: attendanceSuccess
    } = useGetAttendanceQuery('attendanceList', {
        pollingInterval: 120000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const [dateBegin, setDateBegin] = useState((new Date()).setDate(0));
    const [dateEnd, setDateEnd] = useState(new Date());
    const [billNoSearch, setBillNoSearch] = useState('');
    const [gstSearch, setGstSearch] = useState('');

    const [ledgerTableContent, setLedgerTableContent] = useState([]);
    const [jsonContent, setJsonContent] = useState([]);

    const [saleTable, setSaleTable] = useState([]);
    const [jsonSalesContent, setJsonSalesContent] = useState([]);
    const [saleTotals, setSaleTotals] = useState({});

    const [hsnTable, setHsnTable] = useState([]);
    const [jsonHsnContent, setJsonHsnContent] = useState([]);

    const [gstTable, setGstTable] = useState([]);
    const [jsonGstContent, setJsonGstContent] = useState([]);

    //const [jsonAttendance, setJsonAttendance] = useState([]);
    const [attendanceTable, setAttendanceTable] = useState([]);
    const [shopGirl, setShopGirl] = useState('');

    const [andheri, setAndheri] = useState(false)
    const [bandra, setBandra] = useState(false)
    const [powai, setPowai] = useState(false)
    const [purchases, setPurchases] = useState(false)
    const [internal, setInternal] = useState(false)

    const [three, setThree] = useState(false)
    const [five, setFive] = useState(false)
    const [twelve, setTwelve] = useState(false)
    const [eighteen, setEighteen] = useState(false)

    const [reportType, setReportType] = useState('Ledger')

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
                    Date: o.Date, Customer: o.buyer, BillNo: o.BillNo, Name: o.name,
                    Price: 0, gst: o.gst
                })

                item.Price += o.Price

                return r.set(key, item)

            }, new Map()).values()]

            const myGstTable = myGstSummary?.length && myGstSummary.map(key => {
                return (<GstSummary gstrow={key} />)
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
                    description: encoding.hsnDesc.find(entry => entry.hsn === o.HSN).Description,
                    Qty: 0, Price: 0, HSN: o.HSN, gst: o.gst
                })

                item.Qty += o.Qty
                item.Price += o.Price

                return r.set(key, item)

            }, new Map()).values()]

            //console.log('HSN', myHsnSummary)
            const myHsntable = myHsnSummary?.length && myHsnSummary.map(key => {
                return (<HsnSummary hsnrow={key} />)
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
                    adcash: 0, adcard: 0, adupi: 0, adonline: 0, adtotal: 0,
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
            //setJsonSalesContent(mysalessummary)

            const mytable = mysalessummary?.length && mysalessummary.map(date => {
                return (<SalesSummary summaryrow={date} />)
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

            const myjsonContent = filteredIds?.length && filteredIds.map(ledgerId => ({ Date: (new Intl.DateTimeFormat('en-US').format(new Date(entities[ledgerId].createdAt))), BillNo: entities[ledgerId].billno, Barcode: entities[ledgerId].barcode, Qty: entities[ledgerId].qty, Price: entities[ledgerId].totalprice, HSN: entities[ledgerId].hsncode, PaymentType: entities[ledgerId].paymenttype, gst: entities[ledgerId].gst, buyer: entities[ledgerId].buyer, name: entities[ledgerId].name }))
            setJsonContent(myjsonContent)

        }

    }, [isSuccess, dateBegin, dateEnd, billNoSearch, ledger, skuSuccess, skus, id, gstSearch, reportType])

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
                        name: o.name, date: o.date, location: o.location,
                        in: 0, out: 0
                    })

                    if (o.in_out === 'IN') item.in = o.time
                    if (o.in_out === 'OUT') item.out = o.time

                    return r.set(key, item)

                }, new Map()).values()]

                const myattendancetable = myattendanceReformat?.length && myattendanceReformat.map(key => {
                    if (key.name === shopGirl) {
                        return (<StaffAttendance entry={key} />)
                    } else return null
                })

                setAttendanceTable(myattendancetable)
                //setJsonAttendance(myattendanceReformat)

            }

        }

    }, [attendanceSuccess, dateBegin, dateEnd, attendance, shopGirl])


    useEffect(() => {
        let tempstr = ''
        if (andheri) tempstr = tempstr + 'CHAD'
        if (bandra) tempstr = tempstr + (tempstr !== '' ? '|CHBA' : 'CHBA')
        if (powai) tempstr = tempstr + (tempstr !== '' ? '|CHPO' : 'CHPO')
        if (purchases) tempstr = tempstr + 'CHDB|CHOS|CHDN|CHIP'
        if (internal) tempstr = tempstr + 'CHIN'

        setBillNoSearch(tempstr)

    }, [andheri, bandra, powai, purchases, internal])

    useEffect(() => {
        let tempstr = ''
        if (three) tempstr = tempstr + '3'
        if (five) tempstr = tempstr + (tempstr !== '' ? '|5' : '5')
        if (twelve) tempstr = tempstr + (tempstr !== '' ? '|12' : '12')
        if (eighteen) tempstr = tempstr + (tempstr !== '' ? '|18' : '18')

        setGstSearch(tempstr)

    }, [three, five, twelve, eighteen])


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
                        HSN: entry.HSN, GST: entry.gst, Description: entry.description, Quantity: entry.Qty, Price: entry.Price, Taxable: (entry.Price * (1 - entry.gst / 100)).toFixed(2), CGST: (entry.Price * entry.gst / 200).toFixed(2), SGST: (entry.Price * entry.gst / 200).toFixed(2)
                    })
                })
                content = mycontent;
            }
            else if (reportType === 'GST Summary') {
                let mycontent = jsonGstContent.map((entry) => {
                    return ({
                        Date: entry.Date, GST: entry.gst, Customer: entry.Customer, BillNo: entry.BillNo, Product: entry.name, Taxable: (entry.Price * (1 - entry.gst / 100)).toFixed(2), CGST: (entry.Price * entry.gst / 200).toFixed(2), SGST: (entry.Price * entry.gst / 200).toFixed(2), Price: entry.Price
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

        const marginLeft = 40;
        let doc

        let headers
        let data
        if (reportType === 'Ledger') {
            headers = [["Date", "BillNo", "Barcode", "Qty", "Price", "HSN"]]
            data = jsonContent.map(entry => [entry.Date, entry.BillNo, entry.Barcode, entry.Qty, entry.Price, entry.HSN])
            doc = new jsPDF('portrait', 'pt', 'A4');
        } else if (reportType === 'Sales Summary') {
            headers = [["Date", "Ad-Card", "Ad-Cash", "Ad-UPI", "Ad-Online", "Ad-Total",
                "Ba-Card", "Ba-Cash", "Ba-UPI", "Ba-Online", "Ba-Total",
                "Po-Card", "Po-Cash", "Po-UPI", "Po-Online", "Po-Total",
                "Ex-Card", "Ex-Cash", "Ex-UPI", "Ex-Online", "Ex-Total",
            ]]
            data = jsonSalesContent.map(entry => [entry.date, entry.adcard, entry.adcash, entry.adupi, entry.adonline, entry.adtotal,
            entry.bacard, entry.bacash, entry.baupi, entry.baonline, entry.batotal,
            entry.pocard, entry.pocash, entry.poupi, entry.poonline, entry.pototal,
            entry.excard, entry.excash, entry.exupi, entry.exonline, entry.extotal,
            ])
            doc = new jsPDF('landscape', 'pt', 'A4');
        } else if (reportType === 'HSN Report') {
            headers = [["HSN", "GST", "Description", "Quantity", "Price", "Taxable", "CGST", "SGST"
            ]]
            data = jsonHsnContent.map(entry => [entry.HSN, entry.gst, entry.description, entry.Qty, entry.Price, (entry.Price * (1 - entry.gst / 100)).toFixed(2),
            (entry.Price * entry.gst / 200).toFixed(2), (entry.Price * entry.gst / 200).toFixed(2)
            ])
            doc = new jsPDF('portrait', 'pt', 'A4');
        } else if (reportType === 'GST Summary') {
            headers = [["Date", "GST", "Customer", "Bill No.", "Product", "Taxable", "CGST", "SGST", "Price"
            ]]
            data = jsonGstContent.map(entry => [entry.Date, entry.gst, entry.Customer, entry.BillNo, entry.name, (entry.Price * (1 - entry.gst / 100)).toFixed(2),
            (entry.Price * entry.gst / 200).toFixed(2), (entry.Price * entry.gst / 200).toFixed(2), entry.Price
            ])
            doc = new jsPDF('portrait', 'pt', 'A4');
        }

        doc.setFontSize(11);
        let content = {
            startY: 50,
            head: headers,
            body: data
        };
        doc.text("Report", marginLeft, 40);
        doc.autoTable(content);
        doc.save("report.pdf")

    };

    const handleToggleAndheri = () => setAndheri(prev => !prev)
    const handleToggleBandra = () => setBandra(prev => !prev)
    const handleTogglePowai = () => setPowai(prev => !prev)
    const handleTogglePurchases = () => setPurchases(prev => !prev)
    const handleToggleInternal = () => setInternal(prev => !prev)
    const handleToggleThree = () => setThree(prev => !prev)
    const handleToggleFive = () => setFive(prev => !prev)
    const handleToggleTwelve = () => setTwelve(prev => !prev)
    const handleToggleEighteen = () => setEighteen(prev => !prev)

    let ledgerContent
    let salesSummary
    let hsnSummary
    let gstSummary
    let attendanceContent
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
            <div className="ledger--header">
                <button onClick={exportExcel}>GenExcel</button>
                <button onClick={exportPDF}>GenPdf</button>
            </div>
            <br></br>
        </>
    )

    if (attendanceSuccess) {
        attendanceContent = (
            <>
                <label className="form__label" htmlFor="report"> Shop Girl : </label>
                <select id="staff" name="staff" size="1" value={shopGirl} onChange={(e) => setShopGirl(e.target.value)} >
                    {[<option></option>, <option>Ankita</option>, <option>Poornima</option>, <option>Vaishnavi</option>]}
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
                            <th scope="col" className="table__th ledger__ledgername">{saleTotals.becash}</th>
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
                            onChange={handleTogglePurchases}
                            checked={purchases}
                        />
                        Purchases
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
                </div>
                <br></br>
                <p>Search: </p>
                <input type="text" placeholder="Bill Number" onChange={e => setBillNoSearch(e.target.value)} />
                <br></br>
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
                {[<option></option>, <option>Ledger</option>, <option>Sales Summary</option>, <option>HSN Report</option>, <option>GST Summary</option>, <option>Attendance</option>]}
            </select>
            <br></br>
            {dateSelector}
            {(reportType === 'Ledger') && ledgerContent}
            {(reportType === 'Sales Summary') && salesSummary}
            {(reportType === 'HSN Report') && hsnSummary}
            {(reportType === 'GST Summary') && gstSummary}
            {(reportType === 'Attendance') && attendanceContent}

        </>
    )

}

export default LedgerList
