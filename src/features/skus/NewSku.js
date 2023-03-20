import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from "@fortawesome/free-solid-svg-icons"
import { useState, useEffect } from "react"
import { encoding } from '../../data/encoding'
import { useAddNewSkuinvMutation, useGetSkuinvQuery } from '../skuinv/skuinvApiSlice'
import { useNavigate } from "react-router-dom"

const NAME_REGEX = /^[0-9A-z ]{6,20}$/
const DID_REGEX = /^[0-9]{2}$/

const NewSku = () => {

  const [addNewSku, {
    isLoading,
    isSuccess,
    isError,
    error
  }] = useAddNewSkuinvMutation()

  const {
    data: skus,
  } = useGetSkuinvQuery(undefined, {
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true
  })

  const navigate = useNavigate()

  const [brand, setBrand] = useState('')
  const [segment, setSegment] = useState('')
  const [category, setCategory] = useState('')
  const [size, setSize] = useState([])
  const [colour, setColour] = useState('')
  const [subcolour, setSubColour] = useState('')
  const [collection, setCollection] = useState('')
  const [did, setDid] = useState('')
  const [HSNCode, setHSNCode] = useState(0)
  const [name, setName] = useState('')
  const [mrp, setMrp] = useState(0)
  const [mbr, setMbr] = useState(0)
  const [addedskus, setAddedSkus] = useState('')


  const [maxDid, setmaxDid] = useState('NA')
  const [maxScid, setmaxScid] = useState('NA')

  const [validName, setValidName] = useState(false)
  const [validNumber, setValidNumber] = useState(false)
  const [validDid, setValidDid] = useState(false)

  useEffect(() => {
    setValidNumber([mbr, mrp].every(Boolean))
  }, [mrp, mbr])

  useEffect(() => {
    setValidName(NAME_REGEX.test(name))
  }, [name])

  useEffect(() => {
    setValidDid(DID_REGEX.test(did))
  }, [did])

  useEffect(() => {
    if (isSuccess) {
      setMrp(0)
      setMbr()
      navigate(`/dash/skus/${addedskus}`)
    }
  }, [isSuccess, navigate, addedskus])

  const brandoptions = [<option></option>, Object.values(encoding.brands).map(brand => {
    return (<option key={brand.IDENTITY} value={brand.BRAND} > {brand.BRAND}</option >)
  })]
  const segmentoptions = [<option></option>, Object.values(encoding.segments).map(segment => {
    return (<option key={segment.IDENTITY} value={segment.SEGMENT} > {segment.SEGMENT}</option >)
  })]
  const categoryoptions = [<option></option>, Object.values(encoding.categories).map(category => {
    return (<option key={category.IDENTITY} value={category.CATEGORY} > {category.CATEGORY}</option >)
  })]
  const sizeoptions = Object.values(encoding.sizes).map(size => {
    return (<option key={size.IDENTITY} value={size.SIZE} > {size.SIZE}</option >)
  })
  const colouroptions = [<option></option>, Object.values(encoding.colour).map(colour => {
    return (<option key={colour.IDENTITY} value={colour.COLOUR} > {colour.COLOUR}</option >)
  })]
  const subcolouroptions = [<option></option>, Object.values(encoding.subcolours).map(subcolour => {
    return (<option key={subcolour.SubColour} > {subcolour.SubColour}</option >)
  })]
  const collectionoptions = [<option></option>, Object.values(encoding.collections).map(collection => {
    return (<option key={collection.IDENTITY} value={collection.COLLECTION} > {collection.COLLECTION}</option >)
  })]
  const hsnoptions = [<option></option>, Object.values(encoding.HSNCodes).map(hsn => {
    return (<option key={hsn.HSNCode} > {hsn.HSNCode}</option >)
  })]

  useEffect(() => {
    const canUpdateDid = [brand, segment, category, collection].every(Boolean)
    const canUpdateScid = [brand, segment, category, colour, collection, did].every(Boolean)

    const { ids, entities } = skus

    if (canUpdateDid) {

      const didRegex = `${encoding.brands.find(temp => { return temp.BRAND === brand[0]; }).IDENTITY}${encoding.segments.find(temp => { return temp.SEGMENT === segment[0]; }).IDENTITY}${encoding.categories.find(temp => { return temp.CATEGORY === category[0]; }).IDENTITY}...${encoding.collections.find(temp => { return temp.COLLECTION === collection; }).IDENTITY}..`

      let filteredIds = ids.filter(sku => entities[sku].barcode.match(didRegex))

      let maxdid = 0

      filteredIds.forEach(id => {
        //let tempmaxdid = Number(entities[id].SKU.substr(9, 2))
        let tempmaxdid = (entities[id].barcode.length === 11) ? Number(entities[id].barcode.substr(9, 2)) : 0
        maxdid = (maxdid < tempmaxdid) ? tempmaxdid : maxdid
      })

      const maxdidstr = maxdid ? maxdid.toString().length < 2 ? `0${maxdid.toString()}` : maxdid.toString() : "NA"

      setmaxDid(maxdidstr)
    }

    if (canUpdateScid) {

      const scidRegex = `${encoding.brands.find(temp => { return temp.BRAND === brand[0]; }).IDENTITY}${encoding.segments.find(temp => { return temp.SEGMENT === segment[0]; }).IDENTITY}${encoding.categories.find(temp => { return temp.CATEGORY === category[0]; }).IDENTITY}.${encoding.colour.find(temp => { return temp.COLOUR === colour; }).IDENTITY}.${encoding.collections.find(temp => { return temp.COLLECTION === collection; }).IDENTITY}${did}`

      let filteredIds = ids.filter(sku => entities[sku].barcode.match(scidRegex))

      let maxscid = 64

      filteredIds.forEach(id => {
        //let tempmaxscid = entities[id].barcode.charCodeAt(6)
        let tempmaxscid = (entities[id].barcode.length === 11) ? (entities[id].barcode.charCodeAt(6)) : 64
        maxscid = (maxscid < tempmaxscid) ? tempmaxscid : maxscid
      })

      const maxcsidStr = maxscid > 64 ? String.fromCharCode(maxscid) : "NA"

      setmaxScid(maxcsidStr)
    }

  }, [brand, segment, category, colour, collection, did, skus])

  const onBrandChanged = e => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value)
    setBrand(values)
    //updateMaxValues()
  }
  const onSegmentChanged = e => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value)
    setSegment(values)
    //updateMaxValues()
  }
  const onCategoryChanged = e => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value)
    setCategory(values)
    //updateMaxValues()
  }
  const onSizeChanged = e => {
    const values = Array.from(
      e.target.selectedOptions, //HTMLCollection 
      (option) => option.value
    )
    setSize(values)
  }

  const onColourChanged = e => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value)
    setColour(values[0])
    //updateMaxValues()
  }

  const onSubColourChanged = e => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value)
    setSubColour(values)
  }

  const onCollectionChanged = e => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value)
    setCollection(values[0])
    //updateMaxValues()
  }

  const onHsnChanged = e => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value)
    setHSNCode(values)
  }

  const onMrpChanged = e => setMrp(e.target.value)
  const onMbrChanged = e => setMbr(e.target.value)
  const onNameChanged = e => setName(e.target.value)
  const onDidChanged = e => setDid(e.target.value)

  const errClass = isError ? "errmsg" : "offscreen"
  const validNumberClass = !validNumber ? 'form__input--incomplete' : ''
  const validNameClass = !validName ? 'form__input--incomplete' : ''
  const validDidClass = !validDid ? 'form__input--incomplete' : ''

  const canSave = [brand, segment, category, size?.length, colour, subcolour, collection, hsnoptions, mrp, mbr].every(Boolean) && !isLoading

  const onAddSkuClicked = async (e) => {
    e.preventDefault()

    let myaddedskus = ''
    size.forEach(element => {
      const barcode = `${encoding.brands.find(temp => { return temp.BRAND === brand[0]; }).IDENTITY}${encoding.segments.find(temp => { return temp.SEGMENT === segment[0]; }).IDENTITY}${encoding.categories.find(temp => { return temp.CATEGORY === category[0]; }).IDENTITY}${encoding.sizes.find(temp => { return temp.SIZE === element; }).IDENTITY}${encoding.colour.find(temp => { return temp.COLOUR === colour; }).IDENTITY}${subcolour}${encoding.collections.find(temp => { return temp.COLLECTION === collection; }).IDENTITY}${did}`
      myaddedskus = myaddedskus ? (myaddedskus + '-' + barcode) : barcode
    });
    setAddedSkus(myaddedskus)

    size.forEach(async element => {

      const barcode = `${encoding.brands.find(temp => { return temp.BRAND === brand[0]; }).IDENTITY}${encoding.segments.find(temp => { return temp.SEGMENT === segment[0]; }).IDENTITY}${encoding.categories.find(temp => { return temp.CATEGORY === category[0]; }).IDENTITY}${encoding.sizes.find(temp => { return temp.SIZE === element; }).IDENTITY}${encoding.colour.find(temp => { return temp.COLOUR === colour; }).IDENTITY}${subcolour}${encoding.collections.find(temp => { return temp.COLLECTION === collection; }).IDENTITY}${did}`

      if (canSave) {
        await addNewSku({ barcode: barcode, name: name, MRP: mrp, MBR: mbr, HSNCode: Number(HSNCode) })
      }
    });


  }

  const content = (

    <>
      <p className={errClass}>{error?.data?.message}</p>

      <form className="myform" onSubmit={e => e.preventDefault()}>

        <div className="form__title-row">
          <h2>Generate SKU</h2>
          <div className="form__action-buttons">
            <button
              className="icon-button"
              title="Save"
              onClick={onAddSkuClicked}
              disabled={!canSave}
            >
              <FontAwesomeIcon icon={faSave} />
            </button>
          </div>
        </div>
        <div className="form__newsku">
          <label className="form__label" htmlFor="brand">
            Brand:</label>
          <select
            id="brand"
            name="brand"
            className="dummy"
            size="1"
            value={brand}
            onChange={onBrandChanged}
          >
            {brandoptions}
          </select>
        </div>
        <div className="form__newsku">
          <label className="form__label" htmlFor="segment">
            Segment:</label>
          <select
            id="segment"
            name="segment"
            className="dummy"
            size="1"
            value={segment}
            onChange={onSegmentChanged}
          >
            {segmentoptions}
          </select>
        </div>
        <div className="form__newsku">
          <label className="form__label" htmlFor="category">
            Category:</label>
          <select
            id="category"
            name="category"
            className="dummy"
            size="1"
            value={category}
            onChange={onCategoryChanged}
          >
            {categoryoptions}
          </select>
        </div>
        <div className="form__newsku">
          <label className="dropdown-label" htmlFor="collection">
            Collection:</label>
          <select
            id="collection"
            name="collection"
            className="dummy"
            size="1"
            value={collection}
            onChange={onCollectionChanged}
          >
            {collectionoptions}
          </select>
        </div>
        <div className="form__newsku">
          <label className="form__label" htmlFor="did">
            Design ID: (Max used: {maxDid}) <span className="dummy"></span></label>
          <input
            className={`form__input-small ${validDidClass}`}
            id="did"
            name="did"
            type="text"
            autoComplete="off"
            value={did}
            onChange={onDidChanged}
          />
        </div>

        <div className="form__newsku">
          <label className="dropdown-label" htmlFor="colour">
            Colour:</label>
          <select
            id="colour"
            name="colour"
            className="dummy"
            size="1"
            value={colour}
            onChange={onColourChanged}
          >
            {colouroptions}
          </select>
        </div>
        <div className="form__newsku">
          <label className="dropdown-label" htmlFor="subcolour">
            SubColour: (Max used: {maxScid})</label>
          <select
            id="subcolour"
            name="subcolour"
            className="dummy"
            size="1"
            value={subcolour}
            onChange={onSubColourChanged}
          >
            {subcolouroptions}
          </select>
        </div>
        <div className="form__newsku">
          <label className="dropdown-label" htmlFor="size">
            Size: (select multiple)</label>
          <select
            id="size"
            name="size"
            className="dummy-size"
            multiple={true}
            size="6"
            value={size}
            onChange={onSizeChanged}
          >
            {sizeoptions}
          </select>
        </div>
        <div className="form__newsku">
          <label className="form__label" htmlFor="name">
            Name: <span className="dummy"></span></label>
          <input
            className={`form__input ${validNameClass}`}
            id="name"
            name="name"
            type="text"
            autoComplete="off"
            value={name}
            onChange={onNameChanged}
          />
        </div>
        <div className="form__newsku">
          <label className="dropdown-label" htmlFor="hsncode">
            HSN Code:</label>
          <select
            id="hsn"
            name="hsn"
            className="dummy"
            size="1"
            value={HSNCode}
            onChange={onHsnChanged}
          >
            {hsnoptions}
          </select>
        </div>
        <div className="form__newsku">
          <label className="form__label" htmlFor="mrp">
            MRP: <span className="dummy"></span></label>
          <input
            className={`form__input-small ${validNumberClass}`}
            id="mrp"
            name="mrp"
            type="text"
            autoComplete="off"
            value={mrp}
            onChange={onMrpChanged}
          />
        </div>
        <div className="form__newsku">
          <label className="form__label" htmlFor="mbr">
            MBR: <span className="dummy"></span></label>
          <input
            className={`form__input-small ${validNumberClass}`}
            id="mbr"
            name="mbr"
            type="text"
            autoComplete="off"
            value={mbr}
            onChange={onMbrChanged}
          />
        </div>
      </form>
    </>
  )

  return content

}

export default NewSku
