import { useGetMembersQuery } from "./membersApiSlice"
import Member from "./Member"

const MembersList = () => {

    const {
        data: members,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetMembersQuery('membersList', {
        pollingInterval: 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    let content
    if (isLoading) content = <p>Loading...</p>
    if (isError) content = <p className="errmsg">{error?.data?.message}</p>

    if (isSuccess) {
        const { ids, entities } = members

        const tableContent = ids?.length && ids.map(id => <Member key={id}
            memberId={entities[id].barcode}
            phone={entities[id].phone}
            duration={entities[id].duration}
            billno={entities[id].billno}
            prevbillnos={entities[id].prevbillnos}
            time={entities[id].time}
        />)

        content = (
            <table>
                <thead className="table__thead--member">
                    <tr>
                        <th scope="col" className="table__th member__membername">Membership</th>
                        <th scope="col" className="table__th member__membername">Phone</th>
                        <th scope="col" className="table__th member__membername">Duration</th>
                        <th scope="col" className="table__th member__membername">Bill No.</th>
                        <th scope="col" className="table__th member__roles">Prev Bills</th>
                        <th scope="col" className="table__th member__roles">Last Renewal</th>
                    </tr>
                </thead>
                <tbody>
                    {tableContent}
                </tbody>
            </table>
        )
    }

    return content

}

export default MembersList
