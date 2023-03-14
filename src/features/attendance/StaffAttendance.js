import { memo } from 'react'

const StaffAttendance = ({ entry }) => {

    return (
        <tr className="table__row staff--attendance" >
            <td className="table__cell sku__primary">{entry.date}</td>
            <td className="table__cell sku__primary">{entry.location}</td>
            <td className="table__cell sku__primary">{entry.in}</td>
            <td className="table__cell sku__primary">{entry.out}</td>
        </tr>
    )


}

const memoizedStaffAttendance = memo(StaffAttendance)

export default memoizedStaffAttendance