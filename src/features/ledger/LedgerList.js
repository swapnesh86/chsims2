import { useGetLedgerQuery } from "./ledgerApiSlice"
import { useGetSkusQuery } from "../skus/skusApiSlice"
import Ledger from "./Ledger"
import SalesSummary from "./SalesSummary"

import { useState, useEffect } from "react"

import jsPDF from "jspdf";
import "jspdf-autotable";
import FileSaver from "file-saver"

import { useParams } from 'react-router-dom'

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

    const [dateBegin, setDateBegin] = useState((new Date()).setDate(0));
    const [dateEnd, setDateEnd] = useState(new Date());
    const [billNoSearch, setBillNoSearch] = useState('');
    const [ledgerTableContent, setLedgerTableContent] = useState([]);
    const [saleTable, setSaleTable] = useState([]);
    const [jsonContent, setJsonContent] = useState([]);
    const [jsonSalesContent, setJsonSalesContent] = useState([]);
    const [andheri, setAndheri] = useState(false)
    const [bandra, setBandra] = useState(false)
    const [powai, setPowai] = useState(false)
    const [purchases, setPurchases] = useState(false)
    const [internal, setInternal] = useState(false)
    const [reportType, setReportType] = useState('Ledger')

    useEffect(() => {
        let mysalessummary = []

        let prevD = new Date(dateBegin)
        let prevDate = new Date(prevD.setDate(prevD.getDate() - 1))
        for (let i = 0; i < jsonContent?.length; i++) {
            let dateStr = new Intl.DateTimeFormat('en-US').format(new Date(jsonContent[i].Date))
            if (new Date(jsonContent[i].Date) > prevDate && new Date(jsonContent[i].Date) < new Date(dateEnd)) {

                let index = mysalessummary.findIndex((obj) => obj.date === dateStr)
                if (index === -1) {
                    mysalessummary = [...mysalessummary, {
                        date: dateStr, adcash: 0, adcard: 0, adupi: 0, adonline: 0, adtotal: 0,
                        bacash: 0, bacard: 0, baupi: 0, baonline: 0, batotal: 0,
                        pocash: 0, pocard: 0, poupi: 0, poonline: 0, pototal: 0,
                        excash: 0, excard: 0, exupi: 0, exonline: 0, extotal: 0,
                    }]
                    index = mysalessummary.findIndex((obj) => obj.date === dateStr)
                }

                if (jsonContent[i].BillNo.match('CHAD')) {
                    if (jsonContent[i].PaymentType === 'Cash') mysalessummary[index].adcash += jsonContent[i].Price
                    else if (jsonContent[i].PaymentType === 'Card') mysalessummary[index].adcard += jsonContent[i].Price
                    else if (jsonContent[i].PaymentType === 'UPI') mysalessummary[index].adupi += jsonContent[i].Price
                    else if (jsonContent[i].PaymentType === 'Online') mysalessummary[index].adonline += jsonContent[i].Price
                    mysalessummary[index].adtotal += jsonContent[i].Price

                }
                else if (jsonContent[i].BillNo.match('CHBA')) {
                    if (jsonContent[i].PaymentType === 'Cash') mysalessummary[index].bacash += jsonContent[i].Price
                    else if (jsonContent[i].PaymentType === 'Card') mysalessummary[index].bacard += jsonContent[i].Price
                    else if (jsonContent[i].PaymentType === 'UPI') mysalessummary[index].baupi += jsonContent[i].Price
                    else if (jsonContent[i].PaymentType === 'Online') mysalessummary[index].baonline += jsonContent[i].Price
                    mysalessummary[index].batotal += jsonContent[i].Price
                }
                else if (jsonContent[i].BillNo.match('CHPO')) {
                    if (jsonContent[i].PaymentType === 'Cash') mysalessummary[index].pocash += jsonContent[i].Price
                    else if (jsonContent[i].PaymentType === 'Card') mysalessummary[index].pocard += jsonContent[i].Price
                    else if (jsonContent[i].PaymentType === 'UPI') mysalessummary[index].poupi += jsonContent[i].Price
                    else if (jsonContent[i].PaymentType === 'Online') mysalessummary[index].poonline += jsonContent[i].Price
                    mysalessummary[index].pototal += jsonContent[i].Price
                }
                else if (jsonContent[i].BillNo.match('CHEX')) {
                    if (jsonContent[i].PaymentType === 'Cash') mysalessummary[index].excash += jsonContent[i].Price
                    else if (jsonContent[i].PaymentType === 'Card') mysalessummary[index].excard += jsonContent[i].Price
                    else if (jsonContent[i].PaymentType === 'UPI') mysalessummary[index].exupi += jsonContent[i].Price
                    else if (jsonContent[i].PaymentType === 'Online') mysalessummary[index].exonline += jsonContent[i].Price
                    mysalessummary[index].extotal += jsonContent[i].Price
                }
            }
        }

        setJsonSalesContent(mysalessummary)

        const mytable = mysalessummary?.length && mysalessummary.map(date => {
            return (<SalesSummary summaryrow={date} />)
        })

        setSaleTable(mytable)

    }, [jsonContent, dateBegin, dateEnd])

    useEffect(() => {

        if (isSuccess) {

            const { ids, entities } = ledger

            let tempD = new Date(dateBegin)
            let tempDate = new Date(tempD.setDate(tempD.getDate() - 1))

            let filteredIds = ids.filter(entry => (
                new Date(entities[entry].createdAt) > tempDate &&
                new Date(entities[entry].createdAt) <= new Date(dateEnd) &&
                ((id === 'all' && billNoSearch === '') ? 1 : (id !== 'all') ? entities[entry].billno.toLowerCase().match(id.toLowerCase()) : entities[entry].billno.toLowerCase().match(billNoSearch.toLowerCase()))
            )
            )

            const mytableContent = filteredIds?.length && filteredIds.map(ledgerId => {
                return (<Ledger key={ledgerId} ledgerId={ledgerId} />)
            })
            setLedgerTableContent(mytableContent)

            const myjsonContent = filteredIds?.length && filteredIds.map(ledgerId => ({ Date: (new Intl.DateTimeFormat('en-US').format(new Date(entities[ledgerId].createdAt))), BillNo: entities[ledgerId].billno, Barcode: entities[ledgerId].barcode, Qty: entities[ledgerId].qty, Price: entities[ledgerId].totalprice, HSN: entities[ledgerId].hsncode, PaymentType: entities[ledgerId].paymenttype }))
            setJsonContent(myjsonContent)

        }

    }, [isSuccess, dateBegin, dateEnd, billNoSearch, ledger, skuSuccess, skus, id])

    useEffect(() => {
        let tempstr = ''
        if (andheri) tempstr = tempstr + 'CHAD'
        if (bandra) tempstr = tempstr + (tempstr !== '' ? '|CHBA' : 'CHBA')
        if (powai) tempstr = tempstr + (tempstr !== '' ? '|CHPO' : 'CHPO')
        if (purchases) tempstr = tempstr + 'CHDB|CHOS|CHDN'
        if (internal) tempstr = tempstr + 'CHIN'

        setBillNoSearch(tempstr)

    }, [andheri, bandra, powai, purchases, internal])


    const exportExcel = () => {
        import("xlsx").then((xlsx) => {
            let content
            if (reportType === 'Ledger') { content = jsonContent; }
            else if (reportType === 'Sales Summary') { content = jsonSalesContent; }

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

    let ledgerContent
    let salesSummary
    let dateSelector
    if (isLoading) ledgerContent = <p>Loading...</p>
    if (isError) ledgerContent = <p className="errmsg">{error?.data?.message}</p>

    if (isSuccess) {

        dateSelector = (
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
                            <th scope="col" className="table__th ledger__ledgername">Card</th>
                            <th scope="col" className="table__th ledger__ledgername">Cash</th>
                            <th scope="col" className="table__th ledger__ledgername">UPI</th>
                            <th scope="col" className="table__th ledger__ledgername">Online</th>
                            <th scope="col" className="table__th ledger__ledgername">Total</th>
                            <th scope="col" className="table__th ledger__ledgername">Card</th>
                            <th scope="col" className="table__th ledger__ledgername">Cash</th>
                            <th scope="col" className="table__th ledger__ledgername">UPI</th>
                            <th scope="col" className="table__th ledger__ledgername">Online</th>
                            <th scope="col" className="table__th ledger__ledgername">Total</th>
                            <th scope="col" className="table__th ledger__ledgername">Card</th>
                            <th scope="col" className="table__th ledger__ledgername">Cash</th>
                            <th scope="col" className="table__th ledger__ledgername">UPI</th>
                            <th scope="col" className="table__th ledger__ledgername">Online</th>
                            <th scope="col" className="table__th ledger__ledgername">Total</th>
                            <th scope="col" className="table__th ledger__ledgername">Card</th>
                            <th scope="col" className="table__th ledger__ledgername">Cash</th>
                            <th scope="col" className="table__th ledger__ledgername">UPI</th>
                            <th scope="col" className="table__th ledger__ledgername">Online</th>
                            <th scope="col" className="table__th ledger__ledgername">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {saleTable}
                    </tbody>
                </table>
            </>
        )

        ledgerContent = (
            <>
                <div className="ledger--selector">
                    {(id === 'all') && <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggleAndheri}
                            checked={andheri}
                        />
                        Andheri
                    </label>}
                    {(id === 'all') && <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggleBandra}
                            checked={bandra}
                        />
                        Bandra
                    </label>}
                    {(id === 'all') && <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleTogglePowai}
                            checked={powai}
                        />
                        Powai
                    </label>}
                    {(id === 'all') && <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleTogglePurchases}
                            checked={purchases}
                        />
                        Purchases
                    </label>}
                    {(id === 'all') && <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggleInternal}
                            checked={internal}
                        />
                        Internal
                    </label>}
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
                            {/* <th scope="col" className="table__th ledger__ledgername">Seller</th> */}
                            <th scope="col" className="table__th ledger__ledgername">Buyer</th>
                            {/* <th scope="col" className="table__th ledger__ledgername">Phone</th>
                        <th scope="col" className="table__th ledger__ledgername">Email</th> */}
                            <th scope="col" className="table__th ledger__ledgername">Payment Type</th>
                            {/* <th scope="col" className="table__th ledger__ledgername">Membership</th> */}
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
                {[<option></option>, <option>Ledger</option>, <option>Sales Summary</option>]}
            </select>
            <br></br>
            {dateSelector}
            {(reportType === 'Ledger') && ledgerContent}
            {(reportType === 'Sales Summary') && salesSummary}
        </>
    )

}

export default LedgerList
