import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const commissionAdapter = createEntityAdapter({})

const initialState = commissionAdapter.getInitialState()

export const commissionApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getCommission: builder.query({
            query: () => ({
                url: '/commission',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedCommission = responseData.map(commission => {
                    commission.id = commission._id
                    return commission
                });
                return commissionAdapter.setAll(initialState, loadedCommission)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Commission', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'Commission', id }))
                    ]
                } else return [{ type: 'Commission', id: 'LIST' }]
            }
        }),
        addNewCommission: builder.mutation({
            query: initialCommissionData => ({
                url: '/commission',
                method: 'POST',
                body: {
                    ...initialCommissionData,
                }
            }),
            invalidatesTags: [
                { type: 'Commission', id: "LIST" }
            ]
        }),
        updateCommission: builder.mutation({
            query: initialCommissionData => ({
                url: '/commission',
                method: 'PATCH',
                body: {
                    ...initialCommissionData,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Commission', id: arg.id }
            ]
        }),
        deleteCommission: builder.mutation({
            query: ({ id }) => ({
                url: `/commission`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Commission', id: arg.id }
            ]
        }),
    }),
})

export const {
    useGetCommissionQuery,
    useAddNewCommissionMutation,
    useUpdateCommissionMutation,
    useDeleteCommissionMutation,
} = commissionApiSlice

// returns the query result object
export const selectCommissionResult = commissionApiSlice.endpoints.getCommission.select()

// creates memoized selector
const selectCommissionData = createSelector(
    selectCommissionResult,
    commissionResult => commissionResult.data // normalized state object with ids & entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllCommission,
    selectById: selectCommissionById,
    selectIds: selectCommissionIds
    // Pass in a selector that returns the commission slice of state
} = commissionAdapter.getSelectors(state => selectCommissionData(state) ?? initialState)

