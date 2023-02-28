import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUserById } from './usersApiSlice'
import EditUserForm from './EditUserForm'
import { PulseLoader } from 'react-spinners'

const EditUser = () => {
    const { id } = useParams()

    const user = useSelector(state => selectUserById(state, id))

    if (!user) return <PulseLoader color={"#FFF"} />

    const content = <EditUserForm user={user} />

    return content
}
export default EditUser
