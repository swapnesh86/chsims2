import { useSelector } from 'react-redux'
import { selectCurrentToken } from "../features/auth/authSlice"
import jwtDecode from 'jwt-decode'

const useAuth = () => {
    const token = useSelector(selectCurrentToken)
    let isAdInCharge = false
    let isPoInCharge = false
    let isBaInCharge = false
    let isShopManager = false
    let isInventoryManager = false
    let isSkuManager = false
    let isAdmin = false
    let status = "Employee"

    if (token) {
        const decoded = jwtDecode(token)
        const { username, roles } = decoded.UserInfo

        isAdInCharge = roles.includes('AdInCharge')
        isPoInCharge = roles.includes('PoInCharge')
        isBaInCharge = roles.includes('BaInCharge')
        isShopManager = roles.includes('ShopManager')
        isInventoryManager = roles.includes('InventoryManager')
        isSkuManager = roles.includes('SkuManager')
        isAdmin = roles.includes('Admin')

        if (isAdInCharge) status = "Andheri"
        if (isPoInCharge) status = "Powai"
        if (isBaInCharge) status = "Bandra"
        if (isShopManager) status = "ShopManager"
        if (isInventoryManager) status = "InventoryManager"
        if (isSkuManager) status = "SkuManager"
        if (isAdmin) status = "Admin"

        return { username, roles, status, isAdInCharge, isBaInCharge, isPoInCharge, isShopManager, isInventoryManager, isSkuManager, isAdmin }
    }

    return { username: '', roles: [], isAdInCharge, isBaInCharge, isPoInCharge, isShopManager, isInventoryManager, isSkuManager, isAdmin, status }
}
export default useAuth