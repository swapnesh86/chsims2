import { useGetSkuinvQuery } from "../skuinv/skuinvApiSlice";
import Inventory from "./Inventory"
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'

const InventoryList = () => {

    const { id } = useParams()

    const {
        data: skuinv,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetSkuinvQuery('skuinv', {
        pollingInterval: 10 * 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const [search, setSearch] = useState('.......22..');

    useEffect(() => {
        if (id !== 'all') {
            //console.log(id)
            const myArray = id.split("-");
            let mysearch
            myArray.forEach(entry => {
                mysearch = mysearch ? (mysearch + '|' + entry) : entry
            })
            setSearch(mysearch)
        }
    }, [id])

    let content
    if (isLoading) content = <p>Loading...</p>
    if (isError) content = <p className="errmsg">{error?.data?.message}</p>

    if (isSuccess) {
        const { ids, entities } = skuinv

        let filteredIds = ids.filter(sku => (
            entities[sku].name.toLowerCase().match(search.toLowerCase()) ||
            entities[sku].barcode.toLowerCase().match(search.toLowerCase())
        )
        )

        const tableContent = filteredIds?.length && filteredIds.map(skuinvId => {
            return (
                <Inventory key={skuinvId} skuinvId={skuinvId} />
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
                    <thead className="table__thead--skuinv">
                        <tr>
                            <th scope="col" className="table__th skuinv__skuinvname">Barcode</th>
                            <th scope="col" className="table__th skuinv__skuinvname">Name</th>
                            <th scope="col" className="table__th skuinv__skuinvname">Colour</th>
                            <th scope="col" className="table__th skuinv__skuinvname">Size</th>
                            <th scope="col" className="table__th skuinv__skuinvname">MRP</th>
                            <th scope="col" className="table__th skuinv__skuinvname">MBR</th>
                            <th scope="col" className="table__th skuinv__skuinvname">Sourced</th>
                            <th scope="col" className="table__th skuinv__skuinvname">CWEFStore</th>
                            <th scope="col" className="table__th skuinv__skuinvname">Andheri</th>
                            <th scope="col" className="table__th skuinv__skuinvname">Bandra</th>
                            <th scope="col" className="table__th skuinv__skuinvname">Powai</th>
                            <th scope="col" className="table__th skuinv__skuinvname">Exhibition</th>
                            <th scope="col" className="table__th skuinv__skuinvname">Sales</th>
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
