import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const skuinvAdapter = createEntityAdapter({})

const initialState = skuinvAdapter.getInitialState()

export const skuinvApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getSkuinv: builder.query({
            query: () => ({
                url: '/skuinv',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedSkuinv = responseData.map(skuinv => {
                    skuinv.id = skuinv._id
                    return skuinv
                });
                return skuinvAdapter.setAll(initialState, loadedSkuinv)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Skuinv', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'Skuinv', id }))
                    ]
                } else return [{ type: 'Skuinv', id: 'LIST' }]
            }
        }),
        addNewSkuinv: builder.mutation({
            query: initialSkuinvData => ({
                url: '/skuinv',
                method: 'POST',
                body: {
                    ...initialSkuinvData,
                }
            }),
            invalidatesTags: [
                { type: 'Skuinv', id: "LIST" }
            ]
        }),
        updateSkuinv: builder.mutation({
            query: initialSkuinvData => ({
                url: '/skuinv',
                method: 'PATCH',
                body: {
                    ...initialSkuinvData,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Skuinv', id: arg.id }
            ]
        }),
        deleteSkuinv: builder.mutation({
            query: ({ id }) => ({
                url: `/skuinv`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Skuinv', id: arg.id }
            ]
        }),
    }),
})

export const {
    useGetSkuinvQuery,
    useAddNewSkuinvMutation,
    useUpdateSkuinvMutation,
    useDeleteSkuinvMutation,
} = skuinvApiSlice

// returns the query result object
export const selectSkuinvResult = skuinvApiSlice.endpoints.getSkuinv.select()

// creates memoized selector
const selectSkuinvData = createSelector(
    selectSkuinvResult,
    skuinvResult => skuinvResult.data // normalized state object with ids & entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllSkuinv,
    selectById: selectSkuinvById,
    selectIds: selectSkuinvIds
    // Pass in a selector that returns the skuinv slice of state
} = skuinvAdapter.getSelectors(state => selectSkuinvData(state) ?? initialState)
