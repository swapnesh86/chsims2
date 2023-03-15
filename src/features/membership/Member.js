//import { useSelector } from 'react-redux'
//import { selectMemberById } from './membersApiSlice'
import { memo } from 'react'

const Member = ({ memberId, phone, duration, billno, prevbillnos, time }) => {

    const memberBillNosString = prevbillnos?.toString().replaceAll(',', ', ')
    const mydate = new Intl.DateTimeFormat('en-US').format(new Date(time))

    return (
        <tr className="table__row member--row">
            <td className="table__cell bill__entry">{memberId}</td>
            <td className="table__cell bill__entry">{phone}</td>
            <td className="table__cell bill__entry">{duration}</td>
            <td className="table__cell bill__entry">{billno}</td>
            <td className="table__cell bill__entry">{memberBillNosString}</td>
            <td className="table__cell bill__entry">{mydate}</td>
        </tr>
    )


}

const memoizedMember = memo(Member)
export default memoizedMember