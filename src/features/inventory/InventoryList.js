import { useGetInventoryQuery } from "./inventoryApiSlice"
import Inventory from "./Inventory"
import { useState } from 'react';

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

    const [search, setSearch] = useState('.......22..');

    let content
    if (isLoading) content = <p>Loading...</p>
    if (isError) content = <p className="errmsg">{error?.data?.message}</p>

    if (isSuccess) {
        const { ids, entities } = inventory

        let filteredIds = ids.filter(sku => (
            entities[sku].name.toLowerCase().match(search.toLowerCase()) ||
            entities[sku].barcode.toLowerCase().match(search.toLowerCase())
        )
        )

        const tableContent = filteredIds?.length && filteredIds.map(inventoryId => {
            return (
                <Inventory key={inventoryId} inventoryId={inventoryId} />
            )
        })

        content = (
            <>
                <div className="form__myheader" onSubmit={(e) => e.preventDefault()}>
                    <input
                        className="dummy"
                        id='search'
                        type='text'
                        role='searchbox'
                        placeholder='Search by Name/Barcode'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <br></br>
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
            </>
        )


    }

    return content

}

export default InventoryList
