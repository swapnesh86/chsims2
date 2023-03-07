import { useGetLedgerQuery } from "./ledgerApiSlice"
import { useGetSkusQuery } from "../skus/skusApiSlice"
import Ledger from "./Ledger"

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
    const [orderType, setOrderType] = useState('');
    const [tableContent, setTableContent] = useState([]);
    const [jsonContent, setJsonContent] = useState([]);
    const [andheri, setAndheri] = useState(false)
    const [bandra, setBandra] = useState(false)
    const [powai, setPowai] = useState(false)
    const [purchases, setPurchases] = useState(false)
    const [internal, setInternal] = useState(false)

    let content
    if (isLoading) content = <p>Loading...</p>
    if (isError) content = <p className="errmsg">{error?.data?.message}</p>

    useEffect(() => {

        if (isSuccess) {

            const { ids, entities } = ledger

            let filteredIds = ids.filter(entry => (
                new Date(entities[entry].createdAt) >= new Date(dateBegin) &&
                new Date(entities[entry].createdAt) <= new Date(dateEnd) &&
                ((id === 'all' && orderType === '') ? 1 : (id !== 'all') ? entities[entry].billno.toLowerCase().match(id.toLowerCase()) : entities[entry].billno.toLowerCase().match(orderType.toLowerCase()))
                //((orderType === 'all') ? 1 : entities[entry].billno.toLowerCase().includes(orderType.toLowerCase()))
            )
            )

            const mytableContent = filteredIds?.length && filteredIds.map(ledgerId => {
                return (<Ledger key={ledgerId} ledgerId={ledgerId} />)
            })
            setTableContent(mytableContent)

            const myjsonContent = filteredIds?.length && filteredIds.map(ledgerId => ({ Date: (new Intl.DateTimeFormat('en-US').format(new Date(entities[ledgerId].createdAt))), BillNo: entities[ledgerId].billno, Barcode: entities[ledgerId].barcode, Qty: entities[ledgerId].qty, Price: entities[ledgerId].totalprice, HSN: entities[ledgerId].hsncode }))
            setJsonContent(myjsonContent)

        }

    }, [isSuccess, dateBegin, dateEnd, orderType, ledger, skuSuccess, skus, id])

    useEffect(() => {
        let tempstr = ''
        if (andheri) tempstr = tempstr + 'CHAD'
        if (bandra) tempstr = tempstr + 'CHBA'
        if (powai) tempstr = tempstr + 'CHPO'
        if (purchases) tempstr = tempstr + 'CHDB|CHOS|CHDN'
        if (internal) tempstr = tempstr + 'CHIN'

        setOrderType(tempstr)

    }, [andheri, bandra, powai, purchases, internal])


    const exportExcel = () => {
        import("xlsx").then((xlsx) => {
            const workSheet = xlsx.utils.json_to_sheet(jsonContent);
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
        const doc = new jsPDF('portrait', 'pt', 'A4');
        doc.setFontSize(11);
        let headers = [["Date", "BillNo", "Barcode", "Qty", "Price", "HSN"]]
        const data = jsonContent.map(entry => [entry.Date, entry.BillNo, entry.Barcode, entry.Qty, entry.Price, entry.HSN])
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


    if (isSuccess) {

        content = (
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
                <div className="ledger--header">
                    <p>Begin Date: </p>
                    <input type="date" onChange={e => setDateBegin(e.target.value)} />
                    <p>End Date: </p>
                    <input type="date" onChange={e => setDateEnd(e.target.value)} />
                    <p>Search: </p>
                    <input type="text" placeholder="Order Type" onChange={e => setOrderType(e.target.value)} />
                </div>
                <div className="ledger--header">
                    <button onClick={exportExcel}>GenExcel</button>
                    <button onClick={exportPDF}>GenPdf</button>
                </div>
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
                        {tableContent}
                    </tbody>
                </table>
            </>
        )
    }

    return content

}

export default LedgerList
