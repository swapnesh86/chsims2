import { useAddNewAttendanceMutation, useGetAttendanceQuery } from "./attendanceApiSlice"
import { useState, useEffect } from "react"
import useAuth from "../../hooks/useAuth";
import EditAttendance from "./EditAttendance";
import { useNavigate } from "react-router-dom"

const Attendance = () => {

    const [addAttendance, {
        isSuccess: addAttendanceSuccess
    }] = useAddNewAttendanceMutation()

    const {
        data: attendance,
        isSuccess: attendanceSuccess
    } = useGetAttendanceQuery('attendanceList', {
        pollingInterval: 120000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const { isAdmin, isShopManager, isAdInCharge, isBaInCharge, isPoInCharge } = useAuth()
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [location, setLocation] = useState('')
    const [in_out, setInOut] = useState('')
    const [date, setDate] = useState(null)
    const [attendanceTable, setAttendanceTable] = useState(null)
    const [validEntry, setValidEntry] = useState(false)

    useEffect(() => {
        if (addAttendanceSuccess) {
            navigate(`/dash/shopaccounts/attendance-${name}`)
        }
    }, [addAttendanceSuccess, navigate, name])

    useEffect(() => {
        if (name && location && in_out) setValidEntry(true)
        else setValidEntry(false)
    }, [name, location, in_out])

    const logtime = async (e) => {
        e.preventDefault()

        if (validEntry) {
            await addAttendance({ name, location, in_out, time: new Date() })
        }
    }

    const getAttendance = async (e) => {
        e.preventDefault()

        if (name && date) {

            if (attendanceSuccess) {
                const { ids, entities } = attendance

                let filteredIds = ids.filter(entry => (
                    entities[entry].name === name &&
                    (new Date(entities[entry].time)).toDateString() === (new Date(date)).toDateString()
                )
                )

                const mytableContent = filteredIds?.length && filteredIds.map(id => {
                    return (<EditAttendance key={id} attendanceId={id} />)
                })

                setAttendanceTable(mytableContent)

            }
        }
    }

    let content

    content = (
        <>
            <div className="billing--line2">
                <label className="form__label" htmlFor="name">Name: </label>
                <select id="name" name="name" size="1" value={name} onChange={(e) => setName(e.target.value)} >
                    {[<option></option>, <option>Ankita</option>, <option>Poonam</option>, <option>Vaishnavi</option>, <option>Pratima</option>, <option>Neha</option>]}
                </select>
            </div>
            {(isAdmin || isAdInCharge || isBaInCharge || isPoInCharge) &&
                <>
                    <div className="billing--line2">
                        <label className="form__label" htmlFor="location">Location: </label>
                        <select id="location" name="location" size="1" value={location} onChange={(e) => setLocation(e.target.value)} >
                            {[<option></option>, <option>Andheri</option>, <option>Bandra</option>, <option>Powai</option>, <option>Exhibition</option>]}
                        </select>
                    </div>
                    <div className="billing--line2">
                        <label className="form__label" htmlFor="inout">Name: </label>
                        <select id="inout" name="inout" size="1" value={in_out} onChange={(e) => setInOut(e.target.value)} >
                            {[<option></option>, <option>IN</option>, <option>OUT</option>]}
                        </select>
                    </div>
                    <br></br>
                    <button disabled={!validEntry} onClick={logtime}>Log Time</button>
                </>
            }
            {(isAdmin || isShopManager) &&
                <>
                    <div className="billing--line2">
                        <p>Date: </p>
                        <input type="date" onChange={e => setDate(e.target.value)} />
                    </div>
                    <br></br>
                    <button disabled={!name || !date} onClick={getAttendance}>Get Entries</button>
                    <br></br>
                    <br></br>
                    <table>
                        <tbody>
                            {attendanceTable}
                        </tbody>
                    </table>
                </>
            }
        </>
    )


    return (
        content
    )
}

export default Attendance
