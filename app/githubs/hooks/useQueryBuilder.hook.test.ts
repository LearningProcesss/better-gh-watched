import { renderHook } from "@testing-library/react-hooks"

export const useTest = (name: string = "") => `Name: ${name}.`

describe('useTest', () => {
    it('Should be validating the hook is valid', () => {

        const { result: hook } = renderHook(() => useTest())

        expect(hook).toHaveProperty('current')
    })
});



// const fulltext = "rest"

    // const topics = ["oauth2", "orm", "nuxt"]

    // const fullTextStub: IInterpreter = {
    //     interpret: jest.fn().mockReturnValue({
    //         OR: [
    //             {
    //                 name: {
    //                     contains: fulltext
    //                 }
    //             },
    //             {
    //                 full_name: {
    //                     contains: fulltext
    //                 }
    //             },
    //             {
    //                 description: {
    //                     contains: fulltext
    //                 }
    //             },
    //             {
    //                 html_url: {
    //                     contains: fulltext
    //                 }
    //             },
    //             {
    //                 topics: {
    //                     some: {
    //                         value: {
    //                             contains: fulltext
    //                         }
    //                     }
    //                 }
    //             },
    //             {
    //                 languages: {
    //                     some: {
    //                         language: {
    //                             contains: fulltext
    //                         }
    //                     }
    //                 }
    //             }
    //         ]
    //     })
    // }

    // const topicStub: IInterpreter = {
    //     interpret: jest.fn().mockReturnValue({
    //         topics: {
    //             some: {
    //                 value: {
    //                     in: topics
    //                 }
    //             }
    //         }
    //     })
    // }

    // const langStub: IInterpreter = {
    //     interpret: jest.fn().mockReturnValue({
    //         languages: {
    //             some: {
    //                 language: {
    //                     in: ["JavaScript"]
    //                 }
    //             }
    //         }
    //     })
    // }

    // const uiQuery: IGithubQuery = {
    //     search: {
    //         fulltext: "rest"
    //     }
    // }