import { useSelector } from 'react-redux'
import { selectAttendanceById, useDeleteAttendanceMutation, useUpdateAttendanceMutation } from './attendanceApiSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faSave } from "@fortawesome/free-solid-svg-icons"


import { useState, memo } from 'react'

const EditAttendance = ({ attendanceId }) => {

    const attendance = useSelector(state => selectAttendanceById(state, attendanceId))

    //var mytime = new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long' }).format(new Date(attendance?.time))

    //const [time, setTime] = useState(mytime)
    const [time, setTime] = useState(attendance?.time)
    const [location, setLocation] = useState(attendance?.location)
    const [in_out, setInOut] = useState(attendance?.in_out)

    const [deleteAttendance] = useDeleteAttendanceMutation()
    const [updateAttendance] = useUpdateAttendanceMutation()

    const onDeleteAttendanceClicked = async (e) => {
        await deleteAttendance({ id: attendanceId, })
    }

    const onSaveClicked = async (e) => {
        await updateAttendance({ id: attendanceId, name: attendance.name, location: location, in_out: in_out, time: (new Date(time)) })
    }

    if (attendance) {

        return (
            <tr className="table__row editattendance--row" >
                <td className="table__cell attendance__primary">{attendance.name}</td>
                <td className="table__cell sku__primary">
                    <input
                        className='sku_edit_time'
                        id='time'
                        type='text'
                        placeholder={attendance.time}
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                </td>
                <td className="table__cell sku__primary">
                    <input
                        className='sku_edit_num'
                        id='inout'
                        type='text'
                        placeholder={attendance.in_out}
                        value={in_out}
                        onChange={(e) => setInOut(e.target.value)}
                    />
                </td>
                <td className="table__cell sku__primary">
                    <input
                        className='sku_edit_location'
                        id='inout'
                        type='text'
                        placeholder={attendance.location}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </td>
                <td className="table__cell sku__delete">
                    <button
                        className="icon-skudelbutton"
                        title="Save"
                        onClick={onSaveClicked}
                    >
                        <FontAwesomeIcon icon={faSave} />
                    </button>
                </td>
                <td className="table__cell sku__delete">
                    <button
                        className="icon-skudelbutton"
                        value={attendanceId}
                        onClick={onDeleteAttendanceClicked}
                    >
                        <FontAwesomeIcon icon={faTrashCan} />
                    </button>
                </td>
            </tr>
        )

    } else return null
}

const memoizedEditAttendance = memo(EditAttendance)

export default memoizedEditAttendance