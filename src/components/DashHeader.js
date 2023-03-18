import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileCirclePlus, faList, faUserPlus, faRightFromBracket, faMoneyBills, faStore } from "@fortawesome/free-solid-svg-icons"
import { useNavigate, Link, useLocation } from 'react-router-dom'

import { useSendLogoutMutation } from '../features/auth/authApiSlice'
import useAuth from '../hooks/useAuth'

const DASH_REGEX = /^\/dash(\/)?$/
const BILLING_REGEX = /^\/dash\/billing(\/)?$/
const SKUS_REGEX = /^\/dash\/skus\/all(\/)?$/
const USERS_REGEX = /^\/dash\/users(\/)?$/
const LEDGER_REGEX = /^\/dash\/shopaccounts\/ledger(\/)?$/
const INVENTORY_REGEX = /^\/dash\/inventory\/all(\/)?$/

const DashHeader = () => {

    const { isAdmin, isShopManager, isAdInCharge, isPoInCharge, isBaInCharge } = useAuth()

    const navigate = useNavigate()
    const { pathname } = useLocation()

    const [sendLogout, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useSendLogoutMutation()

    useEffect(() => {
        if (isSuccess) navigate('/')
    }, [isSuccess, navigate])

    const onNewBillClicked = () => navigate('/dash/billing')
    const onNewUserClicked = () => navigate('/dash/users/new')
    const onSkuListClicked = () => navigate('/dash/skus/all')
    const onLedgerClicked = () => navigate('/dash/shopaccounts/ledger')
    const onInventoryClicked = () => navigate('/dash/inventory/all')

    let dashClass = null
    if (!DASH_REGEX.test(pathname) && !SKUS_REGEX.test(pathname) && !USERS_REGEX.test(pathname)) {
        dashClass = "dash-header__container--small"
    }

    let newBillButton = null
    if (isAdmin || isShopManager || isAdInCharge || isPoInCharge || isBaInCharge) {
        if (!BILLING_REGEX.test(pathname) && !USERS_REGEX.test(pathname)) {
            newBillButton = (
                <button
                    className="icon-button"
                    title="New Bill"
                    onClick={onNewBillClicked}
                >
                    <FontAwesomeIcon icon={faFileCirclePlus} />
                </button>
            )
        }
    }

    let inventoryButton = null
    if (!INVENTORY_REGEX.test(pathname) && !USERS_REGEX.test(pathname)) {
        inventoryButton = (
            <button
                className="icon-button"
                title="Inventory"
                onClick={onInventoryClicked}
            >
                <FontAwesomeIcon icon={faStore} />
            </button>
        )
    }


    let newUserButton = null
    if (isAdmin) {
        if (USERS_REGEX.test(pathname)) {
            newUserButton = (
                <button
                    className="icon-button"
                    title="New User"
                    onClick={onNewUserClicked}
                >
                    <FontAwesomeIcon icon={faUserPlus} />
                </button>
            )
        }
    }

    let ledgerButton = null

    if (!LEDGER_REGEX.test(pathname) && pathname.includes('/dash') && !USERS_REGEX.test(pathname)) {
        ledgerButton = (
            <button
                className="icon-button"
                title="Shop Accounts"
                onClick={onLedgerClicked}
            >
                <FontAwesomeIcon icon={faMoneyBills} />
            </button>
        )
    }


    let skuListButton = null
    if (!SKUS_REGEX.test(pathname) && pathname.includes('/dash') && !USERS_REGEX.test(pathname)) {
        skuListButton = (
            <button
                className="icon-button"
                title="SkuList"
                onClick={onSkuListClicked}
            >
                <FontAwesomeIcon icon={faList} />
            </button>
        )
    }

    const logoutButton = (
        <button
            className="icon-button"
            title="Logout"
            onClick={sendLogout}
        >
            <FontAwesomeIcon icon={faRightFromBracket} />
        </button>
    )

    const errClass = isError ? "errmsg" : "offscreen"

    let buttonContent
    if (isLoading) {
        buttonContent = <p>Logging Out...</p>
    } else {
        buttonContent = (
            <>
                {newBillButton}
                {newUserButton}
                {skuListButton}
                {ledgerButton}
                {inventoryButton}
                {logoutButton}
            </>
        )
    }

    const content = (

        <>
            <p className={errClass}>{error?.data?.message}</p>
            <header className="dash-header">
                <div className={`dash-header__container ${dashClass}`}>
                    <Link to="/dash">
                        <h1 className="dash-header__title">Creative Handicrafts</h1>
                    </Link>
                    <nav className="dash-header__nav">
                        {buttonContent}
                    </nav>
                </div>
            </header>
        </>
    )

    return content
}

export default DashHeader
