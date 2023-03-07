import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from 'react-router-dom'

//import { useSelector } from 'react-redux'
//import { selectMemberById } from './membersApiSlice'
import { memo } from 'react'

const Member = ({ memberId, phone, duration, billno, prevbillnos, usectr }) => {

    const navigate = useNavigate()


    const handleEdit = () => navigate(`/dash/membership/${memberId}`)

    const memberBillNosString = prevbillnos?.toString().replaceAll(',', ', ')

    return (
        <tr className="table__row member--row">
            <td className="table__cell bill__entry">{memberId}</td>
            <td className="table__cell bill__entry">{phone}</td>
            <td className="table__cell bill__entry">{duration}</td>
            <td className="table__cell bill__entry">{billno}</td>
            <td className="table__cell bill__entry">{memberBillNosString}</td>
            <td className="table__cell bill__entry">
                <button
                    className="icon-button table__button"
                    onClick={handleEdit}
                >
                    <FontAwesomeIcon icon={faPenToSquare} />
                </button>
            </td>
        </tr>
    )


}

const memoizedMember = memo(Member)
export default memoizedMember