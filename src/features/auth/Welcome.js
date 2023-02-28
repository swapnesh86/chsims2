import { Link } from "react-router-dom"
import useAuth from "../../hooks/useAuth"


const Welcome = () => {

    const { isManager, isAdmin } = useAuth()
    const date = new Date()
    const today = new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long' }).format(date)

    const content = (
        <section className="welcome">

            <p>{today}</p>

            <h1>Welcome to SIMS 2.0!</h1>

            {(!isManager && !isAdmin) && <p><Link to="/dash/skus">View SKUs</Link></p>}
            {(isManager || isAdmin) && <p><Link to="/dash/skus/new">Generate SKUs</Link></p>}
            {(isManager || isAdmin) && <p><Link to="/dash/skus">View / Edit SKUs</Link></p>}
            {isAdmin && <p><Link to="/dash/users/new">Create New User</Link></p>}
            {isAdmin && <p><Link to="/dash/users">View / Edit Users</Link></p>}

        </section>
    )

    return content
}

export default Welcome
