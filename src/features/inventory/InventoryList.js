import { useGetInventoryQuery } from "./inventoryApiSlice"
import Inventory from "./Inventory"

const InventoryList = () => {

    const {
        data: inventory,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetInventoryQuery('inventory', {
        pollingInterval: 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    let content
    if (isLoading) content = <p>Loading...</p>
    if (isError) content = <p className="errmsg">{error?.data?.message}</p>

    if (isSuccess) {
        const { ids } = inventory

        const tableContent = ids?.length && ids.map(inventoryId => {
            return (
                <Inventory key={inventoryId} inventoryId={inventoryId} />
            )
        })

        content = (
            <table >
                <thead className="table__thead--inventory">
                    <tr>
                        <th scope="col" className="table__th inventory__inventoryname">Barcode</th>
                        <th scope="col" className="table__th inventory__inventoryname">Name</th>
                        <th scope="col" className="table__th inventory__inventoryname">Colour</th>
                        <th scope="col" className="table__th inventory__inventoryname">Size</th>
                        <th scope="col" className="table__th inventory__inventoryname">Sourced</th>
                        <th scope="col" className="table__th inventory__inventoryname">CWEFStore</th>
                        <th scope="col" className="table__th inventory__inventoryname">Andheri</th>
                        <th scope="col" className="table__th inventory__inventoryname">Bandra</th>
                        <th scope="col" className="table__th inventory__inventoryname">Powai</th>
                        <th scope="col" className="table__th inventory__inventoryname">Exhibition</th>
                        <th scope="col" className="table__th inventory__inventoryname">Sales</th>
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

export default InventoryList
