import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const billNosAdapter = createEntityAdapter({})

const initialState = billNosAdapter.getInitialState()

export const billNosApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getBillNos: builder.query({
            query: () => ({
                url: '/billnos',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedBillNos = responseData.map(billNo => {
                    billNo.id = billNo._id
                    return billNo
                });
                return billNosAdapter.setAll(initialState, loadedBillNos)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'BillNo', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'BillNo', id }))
                    ]
                } else return [{ type: 'BillNo', id: 'LIST' }]
            }
        }),
        updateBillNo: builder.mutation({
            query: initialBillNoData => ({
                url: '/billnos',
                method: 'PATCH',
                body: {
                    ...initialBillNoData,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'BillNo', id: arg.id }
            ]
        }),

    }),
})

export const {
    useGetBillNosQuery,
    useUpdateBillNoMutation,
} = billNosApiSlice

// returns the query result object
export const selectBillNosResult = billNosApiSlice.endpoints.getBillNos.select()

// creates memoized selector
const selectBillNosData = createSelector(
    selectBillNosResult,
    billNosResult => billNosResult.data // normalized state object with ids & entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllBillNos,
    selectById: selectBillNoById,
    selectIds: selectBillNoIds
    // Pass in a selector that returns the billNos slice of state
} = billNosAdapter.getSelectors(state => selectBillNosData(state) ?? initialState)

export const finyearNow = (timevar) => {
    var time = timevar ? (new Date(timevar)) : new Date();
    var yy = String(time.getFullYear()).substr(2, 2)
    var mm = time.getMonth() + 1;
    if (mm <= 3) { return (parseInt(yy) - 1); }
    else { return parseInt(yy); }
}

export const pad = (num) => {
    num = num.toString();
    while (num.length < 5) num = "0" + num;
    return num;
}

export const categorySelect = (seller, buyer) => {
    if (seller === 'CH' && buyer === 'CWEFStore') return 'DB'
    if (seller === 'OS' && buyer === 'CWEFStore') return 'OS'
    if (seller === 'CWEF' && buyer === 'CWEFStore') return 'IP'
    if (seller === 'CWEFStore' && buyer === 'CH') return 'DN'
    if (seller === 'CWEFStore' && buyer === 'OS') return 'RS'
    if ((seller === 'CWEFStore' || seller === 'Andheri' || seller === 'Bandra' || seller === 'Powai' || seller === 'Exhibition')
        && (buyer === 'CWEFStore' || buyer === 'Andheri' || buyer === 'Bandra' || buyer === 'Powai' || buyer === 'Exhibition')) return 'IN'
    if (seller === 'Andheri') return 'AD'
    if (seller === 'Bandra') return 'BA'
    if (seller === 'Powai') return 'PO'
    if (seller === 'Exhibition') return 'EX'
}
