import { store } from '../../app/store'
import { skusApiSlice } from '../skus/skusApiSlice'
import { usersApiSlice } from '../users/usersApiSlice';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

const Prefetch = () => {
    useEffect(() => {
        //console.log('subscribing')
        const skus = store.dispatch(skusApiSlice.endpoints.getSkus.initiate())
        const users = store.dispatch(usersApiSlice.endpoints.getUsers.initiate())

        /* store.dispatch(skusApiSlice.util.prefetch('getSkus', 'skuList', { force: true }))
        store.dispatch(usersApiSlice.util.prefetch('getUsers', 'usersList', { force: true })) */

        return () => {
            //console.log('unsubscribing')
            skus.unsubscribe()
            users.unsubscribe()
        }
    }, [])

    return <Outlet />
}
export default Prefetch