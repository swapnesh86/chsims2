import { Link } from "react-router-dom"
import useAuth from "../../hooks/useAuth"


const Welcome = () => {

    const { isSkuManager, isAdmin, isPoInCharge, isAdInCharge, isBaInCharge, isShopManager } = useAuth()
    const date = new Date()
    const today = new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long' }).format(date)

    const billingText = (isAdInCharge || isBaInCharge || isPoInCharge) ? 'Billing / Returns' : 'Billing / Transfers'
    const skuText = (isAdInCharge || isBaInCharge || isPoInCharge || isShopManager) ? 'View SKU List' : 'View / Edit SKUs'

    const content = (
        <section className="welcome">

            <p>{today}</p>

            <h1>Welcome to SIMS 2.0!</h1>
            {(isAdmin || isShopManager || isAdInCharge || isBaInCharge || isPoInCharge) &&
                <>
                    <h3><Link to="/dash/billing">{billingText}</Link></h3>
                </>
            }
            <h3><Link to="/dash/inventory/all">Inventory</Link></h3>
            <h3><Link to="/dash/shopaccounts/ledger">Accounts Summary</Link></h3>
            <br></br>
            <h3>SKU Details</h3>
            <div className="indent">
                {(isSkuManager || isAdmin) && <p><Link to="/dash/skus/new">Generate SKUs</Link></p>}
                <p><Link to="/dash/skus">{skuText}</Link></p>
            </div>
            {isAdmin &&
                <>
                    <h3>User Details</h3>
                    <div className="indent">
                        <p><Link to="/dash/users/new">Create New User</Link></p>
                        <p><Link to="/dash/users">View / Edit Users</Link></p>
                    </div>
                </>
            }
            {(isAdmin || isShopManager || isAdInCharge || isBaInCharge || isPoInCharge) &&
                <>
                    <h3>Membership</h3>
                    <div className="indent">
                        <p><Link to="/dash/membership">Memberships</Link></p>
                        <p><Link to="/dash/membership/new">Create New Membership</Link></p>
                    </div>
                    <h3><Link to="/dash/attendance">Attendance</Link></h3>
                </>
            }


        </section >
    )

    return content
}

export default Welcome
