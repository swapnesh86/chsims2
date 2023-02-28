import { useGetSkusQuery } from "./skusApiSlice"
import { useState } from 'react';
import Sku from "./Sku"
import EditSku from "./EditSku"

import useAuth from "../../hooks/useAuth";

const SearchSkuList = () => {

  const { isAdmin, isManager } = useAuth()
  const [search, setSearch] = useState('');
  const [edit, setEdit] = useState(false)

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

  const handleToggle = () => setEdit(prev => !prev)

  let content
  if (isLoading) content = <p>Loading...</p>
  if (isError) content = <p className="errmsg">{error?.data?.message}</p>

  if (isSuccess) {
    const { ids, entities } = skus

    let filteredIds = ids.filter(sku => (
      entities[sku].Name.toLowerCase().includes(search.toLowerCase()) ||
      entities[sku].Barcode.toLowerCase().includes(search.toLowerCase())
    )
    )

    const tableContent = (ids?.length && edit)
      ? filteredIds.map(skuId => <EditSku key={skuId} skuId={skuId} />)
      : ids?.length
        ? filteredIds.map(skuId => <Sku key={skuId} skuId={skuId} />)
        : null

    const errClass = (isAdmin && edit) ? "table--skuseditdel" : (isManager && edit) ? "table--skusedit" : "table--skus"
    const editClass = edit ? "sku__primary" : "sku__optional"

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
          {(isAdmin || isManager) && <label htmlFor="persist" className="form__persist">
            <input
              type="checkbox"
              className="form__checkbox"
              id="persist"
              onChange={handleToggle}
              checked={edit}
            />
            Edit SKUs
          </label>}

        </div>
        <br></br>
        <table className={`table ${errClass}`}>
          <thead className="table__thead">
            <tr>
              <th scope="col" className="table__th sku__primary">Barcode</th>
              <th scope="col" className="table__th sku__optional">SKU</th>
              <th scope="col" className="table__th sku__primary">Name</th>
              <th scope="col" className="table__th sku__primary">MRP</th>
              <th scope="col" className={`table__th ${editClass}`}>MBR</th>
              <th scope="col" className={`table__th ${editClass}`}>HSNCode</th>
              {(isAdmin || isManager) && edit && <th scope="col" className="table__th sku__primary">Edit</th>}
              {isAdmin && edit && <th scope="col" className="table__th sku__primary">Delete</th>}
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

export default SearchSkuList


