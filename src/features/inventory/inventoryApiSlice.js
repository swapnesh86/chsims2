import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const inventoryAdapter = createEntityAdapter({})

const initialState = inventoryAdapter.getInitialState()

export const inventoryApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getInventory: builder.query({
            query: () => ({
                url: '/inventory',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedInventory = responseData.map(inventory => {
                    inventory.id = inventory._id
                    return inventory
                });
                return inventoryAdapter.setAll(initialState, loadedInventory)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Inventory', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'Inventory', id }))
                    ]
                } else return [{ type: 'Inventory', id: 'LIST' }]
            }
        }),
        addNewInventory: builder.mutation({
            query: initialInventoryData => ({
                url: '/inventory',
                method: 'POST',
                body: {
                    ...initialInventoryData,
                }
            }),
            invalidatesTags: [
                { type: 'Inventory', id: "LIST" }
            ]
        }),
        updateInventory: builder.mutation({
            query: initialInventoryData => ({
                url: '/inventory',
                method: 'PATCH',
                body: {
                    ...initialInventoryData,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Inventory', id: arg.id }
            ]
        }),
        deleteInventory: builder.mutation({
            query: ({ id }) => ({
                url: `/inventory`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Inventory', id: arg.id }
            ]
        }),
    }),
})

export const {
    useGetInventoryQuery,
    useAddNewInventoryMutation,
    useUpdateInventoryMutation,
    useDeleteInventoryMutation,
} = inventoryApiSlice

// returns the query result object
export const selectInventoryResult = inventoryApiSlice.endpoints.getInventory.select()

// creates memoized selector
const selectInventoryData = createSelector(
    selectInventoryResult,
    inventoryResult => inventoryResult.data // normalized state object with ids & entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllInventory,
    selectById: selectInventoryById,
    selectIds: selectInventoryIds
    // Pass in a selector that returns the inventory slice of state
} = inventoryAdapter.getSelectors(state => selectInventoryData(state) ?? initialState)
