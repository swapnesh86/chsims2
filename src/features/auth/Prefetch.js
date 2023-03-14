import { store } from '../../app/store'
import { skusApiSlice } from '../skus/skusApiSlice'
import { usersApiSlice } from '../users/usersApiSlice';
import { ledgerApiSlice } from '../ledger/ledgerApiSlice';
import { inventoryApiSlice } from '../inventory/inventoryApiSlice'
import { membersApiSlice } from '../membership/membersApiSlice';
import { attendanceApiSlice } from '../attendance/attendanceApiSlice';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

const Prefetch = () => {
    useEffect(() => {
        //console.log('subscribing')
        const skus = store.dispatch(skusApiSlice.endpoints.getSkus.initiate())
        const users = store.dispatch(usersApiSlice.endpoints.getUsers.initiate())
        const ledger = store.dispatch(ledgerApiSlice.endpoints.getLedger.initiate())
        const members = store.dispatch(membersApiSlice.endpoints.getMembers.initiate())
        const inventory = store.dispatch(inventoryApiSlice.endpoints.getInventory.initiate())
        const attendance = store.dispatch(attendanceApiSlice.endpoints.getAttendance.initiate())

        /* store.dispatch(skusApiSlice.util.prefetch('getSkus', 'skuList', { force: true }))
        store.dispatch(usersApiSlice.util.prefetch('getUsers', 'usersList', { force: true })) */

        return () => {
            //console.log('unsubscribing')
            skus.unsubscribe()
            users.unsubscribe()
            ledger.unsubscribe()
            members.unsubscribe()
            inventory.unsubscribe()
            attendance.unsubscribe()
        }
    }, [])

    return <Outlet />
}
export default Prefetch