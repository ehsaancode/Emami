import { postReq } from "../../helpers/api"
import { baseApiUrl } from "../../helpers/constants"

export const deleteMasterData = async ({type, id}) => {
    try {
        const response = await postReq(baseApiUrl+ '/client-project/al-fadly/delete-master-data', {type, id});
        return {data:response, error: null}
    } catch (error) {
        return {data: null, error}
    }
}
