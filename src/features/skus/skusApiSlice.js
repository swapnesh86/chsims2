import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const skusAdapter = createEntityAdapter({})

const initialState = skusAdapter.getInitialState()

export const skusApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getSkus: builder.query({
            query: () => ({
                url: '/skus',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedSkus = responseData.map(sku => {
                    sku.id = sku._id
                    return sku
                });
                return skusAdapter.setAll(initialState, loadedSkus)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Sku', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'Sku', id }))
                    ]
                } else return [{ type: 'Sku', id: 'LIST' }]
            }
        }),
        addNewSku: builder.mutation({
            query: initialSkuData => ({
                url: '/skus',
                method: 'POST',
                body: {
                    ...initialSkuData,
                }
            }),
            invalidatesTags: [
                { type: 'Sku', id: "LIST" }
            ]
        }),
        updateSku: builder.mutation({
            query: initialSkuData => ({
                url: '/skus',
                method: 'PATCH',
                body: {
                    ...initialSkuData,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Sku', id: arg.id }
            ]
        }),
        deleteSku: builder.mutation({
            query: ({ id }) => ({
                url: `/skus`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Sku', id: arg.id }
            ]
        }),
    }),
})

export const {
    useGetSkusQuery,
    useAddNewSkuMutation,
    useUpdateSkuMutation,
    useDeleteSkuMutation,
} = skusApiSlice

// returns the query result object
export const selectSkusResult = skusApiSlice.endpoints.getSkus.select()

// creates memoized selector
const selectSkusData = createSelector(
    selectSkusResult,
    skusResult => skusResult.data // normalized state object with ids & entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllSkus,
    selectById: selectSkuById,
    selectIds: selectSkuIds
    // Pass in a selector that returns the skus slice of state
} = skusAdapter.getSelectors(state => selectSkusData(state) ?? initialState)
