import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const ledgerAdapter = createEntityAdapter({})

const initialState = ledgerAdapter.getInitialState()

export const ledgerApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getLedger: builder.query({
            query: () => ({
                url: '/ledger',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedLedger = responseData.map(ledger => {
                    ledger.id = ledger._id
                    return ledger
                });
                return ledgerAdapter.setAll(initialState, loadedLedger)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Ledger', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'Ledger', id }))
                    ]
                } else return [{ type: 'Ledger', id: 'LIST' }]
            }
        }),
        addNewLedger: builder.mutation({
            query: initialLedgerData => ({
                url: '/ledger',
                method: 'POST',
                body: {
                    ...initialLedgerData,
                }
            }),
            invalidatesTags: [
                { type: 'Ledger', id: "LIST" }
            ]
        }),
        updateLedger: builder.mutation({
            query: initialLedgerData => ({
                url: '/ledger',
                method: 'PATCH',
                body: {
                    ...initialLedgerData,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Ledger', id: arg.id }
            ]
        }),
        deleteLedger: builder.mutation({
            query: ({ id }) => ({
                url: `/ledger`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Ledger', id: arg.id }
            ]
        }),
    }),
})

export const {
    useGetLedgerQuery,
    useAddNewLedgerMutation,
    useUpdateLedgerMutation,
    useDeleteLedgerMutation,
} = ledgerApiSlice

// returns the query result object
export const selectLedgerResult = ledgerApiSlice.endpoints.getLedger.select()

// creates memoized selector
const selectLedgerData = createSelector(
    selectLedgerResult,
    ledgerResult => ledgerResult.data // normalized state object with ids & entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllLedger,
    selectById: selectLedgerById,
    selectIds: selectLedgerIds
    // Pass in a selector that returns the ledger slice of state
} = ledgerAdapter.getSelectors(state => selectLedgerData(state) ?? initialState)
