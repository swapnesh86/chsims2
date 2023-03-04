import { useGetLedgerQuery } from "./ledgerApiSlice"
import Ledger from "./Ledger"

const LedgerList = () => {

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

    let content
    if (isLoading) content = <p>Loading...</p>
    if (isError) content = <p className="errmsg">{error?.data?.message}</p>

    if (isSuccess) {
        const { ids } = ledger

        const tableContent = ids?.length && ids.map(ledgerId => <Ledger key={ledgerId} ledgerId={ledgerId} />)

        content = (
            <table >
                <thead className="table__thead--ledger">
                    <tr>
                        <th scope="col" className="table__th ledger__ledgername">Billno</th>
                        <th scope="col" className="table__th ledger__ledgername">Barcode</th>
                        <th scope="col" className="table__th ledger__ledgername">OrderType</th>
                        <th scope="col" className="table__th ledger__ledgername">Buyer</th>
                        <th scope="col" className="table__th ledger__ledgername">Seller</th>
                        <th scope="col" className="table__th ledger__ledgername">Phone</th>
                        <th scope="col" className="table__th ledger__ledgername">Email</th>
                        <th scope="col" className="table__th ledger__ledgername">Payment Type</th>
                        <th scope="col" className="table__th ledger__ledgername">Membership</th>
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
        )
    }

    return content

}

export default LedgerList
