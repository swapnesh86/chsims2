import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHouse } from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from "react-router-dom"
//import { useLocation } from "react-router-dom"
import useAuth from "../hooks/useAuth"

const DashFooter = () => {

    const { username, status } = useAuth()
    const navigate = useNavigate()
    //const { pathname } = useLocation()

    const onGoHomeClicked = () => navigate('/dash')

    let goHomeButton = null
    //if (pathname !== '/dash') {         // Basically do not show the Dash-Home button in the footer if you are on the dash home page
    goHomeButton = (
        <button
            className="dash-footer__button icon-button"
            title="Home"
            onClick={onGoHomeClicked}
        >
            <FontAwesomeIcon icon={faHouse} />
        </button>

    )
    //}



    const content = (
        <footer className="dash-footer">
            {goHomeButton}
            <p className="dash-footer__status">Current User: {username}</p>
            <p className="dash-footer__status">Status: {status}</p>
            <p className="dash-footer__credits">SJs Inventory Management System</p>
        </footer>
    )
    return content
}

export default DashFooter
