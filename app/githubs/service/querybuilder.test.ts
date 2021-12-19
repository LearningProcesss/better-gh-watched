import { FullTextInterpreter, IInterpreter, IQueryBuilderService, LanguageInterpreter, QueryBuilderService, TopicInterpreter } from '.';

describe('IInterpreter', () => {
    describe('IInterpreter concrete empty return', () => {
        it('should FullTextInterpreter return empty object if data is not valid', () => {

            const interpreter: IInterpreter = new FullTextInterpreter()

            const result = interpreter.interpret({ search: {} })

            expect(result).toStrictEqual({})
        });
        it('should TopicInterpreter return empty object if data is not valid', () => {

            const interpreter: IInterpreter = new TopicInterpreter()

            const result = interpreter.interpret({ search: {} })

            expect(result).toStrictEqual({})
        });
        it('should LanguageInterpreter return empty object if data is not valid', () => {

            const interpreter: IInterpreter = new LanguageInterpreter()

            const result = interpreter.interpret({ search: {} })

            expect(result).toStrictEqual({})
        });
    });
    describe('IInterpreter concrete valid return', () => {
        it('should FullTextInterpreter return valid object if data is valid', () => {

            const fulltext = "rest"

            const interpreter: IInterpreter = new FullTextInterpreter()

            const result = interpreter.interpret({ search: { fulltext } })

            const expected = {
                OR: [
                    {
                        name: {
                            contains: fulltext
                        }
                    },
                    {
                        full_name: {
                            contains: fulltext
                        }
                    },
                    {
                        description: {
                            contains: fulltext
                        }
                    },
                    {
                        html_url: {
                            contains: fulltext
                        }
                    },
                    {
                        topics: {
                            some: {
                                value: {
                                    contains: fulltext
                                }
                            }
                        }
                    },
                    {
                        languages: {
                            some: {
                                language: {
                                    contains: fulltext
                                }
                            }
                        }
                    }
                ]
            }

            expect(result).toStrictEqual(expected)
        });
        it('should TopicInterpreter return valid object if data is valid', () => {

            const topics = ["rest", "nuxt", "typescript"]

            const interpreter: IInterpreter = new TopicInterpreter()

            const result = interpreter.interpret({ search: { topics } })

            const expected = {
                topics: {
                    some: {
                        value: {
                            in: topics
                        }
                    }
                }
            }

            expect(result).toStrictEqual(expected)
        });
        it('should LanguageInterpreter return valid object if data is valid', () => {

            const languages = ["C#", "Python"]

            const interpreter: IInterpreter = new LanguageInterpreter()

            const result = interpreter.interpret({ search: { languages } })

            const expected = {
                languages: {
                    some: {
                        language: {
                            in: languages
                        }
                    }
                }
            }

            expect(result).toStrictEqual(expected)
        });
    });
});

describe('QueryBuilderService', () => {

    it('should constructor throws exception if one or more parameters are not init', () => {
        expect(() => { new QueryBuilderService([]) }).toThrow(new Error("interpreters must contains at least one interpreter"))
    });

    it('should build() method call each dependency only one time', () => {

        const fullTextStub: IInterpreter = {
            interpret: jest.fn().mockReturnValue({})
        }

        const topicStub: IInterpreter = {
            interpret: jest.fn().mockReturnValue({})
        }

        const languageStub: IInterpreter = {
            interpret: jest.fn().mockReturnValue({})
        }

        const queryBuilder: IQueryBuilderService = new QueryBuilderService([fullTextStub, topicStub, languageStub])

        queryBuilder.build({ search: {} })

        expect(fullTextStub.interpret).toHaveBeenCalledTimes(1)
        expect(topicStub.interpret).toHaveBeenCalledTimes(1)
        expect(languageStub.interpret).toHaveBeenCalledTimes(1)
    });

    it('should create where object without AND array and only fulltext condition', () => {

        const fulltext = "rest"

        const fullTextStub: IInterpreter = {
            interpret: jest.fn().mockReturnValue({
                OR: [
                    {
                        name: {
                            contains: fulltext
                        }
                    },
                    {
                        full_name: {
                            contains: fulltext
                        }
                    },
                    {
                        description: {
                            contains: fulltext
                        }
                    },
                    {
                        html_url: {
                            contains: fulltext
                        }
                    },
                    {
                        topics: {
                            some: {
                                value: {
                                    contains: fulltext
                                }
                            }
                        }
                    },
                    {
                        languages: {
                            some: {
                                language: {
                                    contains: fulltext
                                }
                            }
                        }
                    }
                ]
            })
        }

        const topicStub: IInterpreter = {
            interpret: jest.fn().mockReturnValue({})
        }

        const languageStub: IInterpreter = {
            interpret: jest.fn().mockReturnValue({})
        }

        const whereExpected = {
            OR: [
                {
                    name: {
                        contains: fulltext
                    }
                },
                {
                    full_name: {
                        contains: fulltext
                    }
                },
                {
                    description: {
                        contains: fulltext
                    }
                },
                {
                    html_url: {
                        contains: fulltext
                    }
                },
                {
                    topics: {
                        some: {
                            value: {
                                contains: fulltext
                            }
                        }
                    }
                },
                {
                    languages: {
                        some: {
                            language: {
                                contains: fulltext
                            }
                        }
                    }
                }
            ]
        }

        const queryBuilder: IQueryBuilderService = new QueryBuilderService([fullTextStub, topicStub, languageStub])

        const result = queryBuilder.build({ search: { fulltext } })

        expect(fullTextStub.interpret).toHaveBeenCalledTimes(1)
        expect(result).toStrictEqual(whereExpected)
    });

    it('should create where object with AND array that contains fulltext and topic interpretations', () => {

        const fulltext = "rest"

        const topics = ["oauth2", "orm", "nuxt"]

        const fullTextStub: IInterpreter = {
            interpret: jest.fn().mockReturnValue({
                OR: [
                    {
                        name: {
                            contains: fulltext
                        }
                    },
                    {
                        full_name: {
                            contains: fulltext
                        }
                    },
                    {
                        description: {
                            contains: fulltext
                        }
                    },
                    {
                        html_url: {
                            contains: fulltext
                        }
                    },
                    {
                        topics: {
                            some: {
                                value: {
                                    contains: fulltext
                                }
                            }
                        }
                    },
                    {
                        languages: {
                            some: {
                                language: {
                                    contains: fulltext
                                }
                            }
                        }
                    }
                ]
            })
        }

        const topicStub: IInterpreter = {
            interpret: jest.fn().mockReturnValue({
                topics: {
                    some: {
                        value: {
                            in: topics
                        }
                    }
                }
            })
        }

        const whereExpected = {
            AND: [
                {
                    OR: [
                        {
                            name: {
                                contains: fulltext
                            }
                        },
                        {
                            full_name: {
                                contains: fulltext
                            }
                        },
                        {
                            description: {
                                contains: fulltext
                            }
                        },
                        {
                            html_url: {
                                contains: fulltext
                            }
                        },
                        {
                            topics: {
                                some: {
                                    value: {
                                        contains: fulltext
                                    }
                                }
                            }
                        },
                        {
                            languages: {
                                some: {
                                    language: {
                                        contains: fulltext
                                    }
                                }
                            }
                        }
                    ]
                },
                {
                    topics: {
                        some: {
                            value: {
                                in: topics
                            }
                        }
                    }
                }
            ]
        }

        const queryBuilder: IQueryBuilderService = new QueryBuilderService([fullTextStub, topicStub])

        const result = queryBuilder.build({ search: {} })

        console.log(result)

        expect(fullTextStub.interpret).toHaveBeenCalledTimes(1)
        expect(topicStub.interpret).toHaveBeenCalledTimes(1)
        expect(result).toStrictEqual(whereExpected)
    });

    it('should create where object with AND array that contains fulltext, topic, lang interpretations', () => {

        const fulltext = "rest"

        const topics = ["oauth2", "orm", "nuxt"]

        const fullTextStub: IInterpreter = {
            interpret: jest.fn().mockReturnValue({
                OR: [
                    {
                        name: {
                            contains: fulltext
                        }
                    },
                    {
                        full_name: {
                            contains: fulltext
                        }
                    },
                    {
                        description: {
                            contains: fulltext
                        }
                    },
                    {
                        html_url: {
                            contains: fulltext
                        }
                    },
                    {
                        topics: {
                            some: {
                                value: {
                                    contains: fulltext
                                }
                            }
                        }
                    },
                    {
                        languages: {
                            some: {
                                language: {
                                    contains: fulltext
                                }
                            }
                        }
                    }
                ]
            })
        }

        const topicStub: IInterpreter = {
            interpret: jest.fn().mockReturnValue({
                topics: {
                    some: {
                        value: {
                            in: topics
                        }
                    }
                }
            })
        }

        const langStub: IInterpreter = {
            interpret: jest.fn().mockReturnValue({
                languages: {
                    some: {
                        language: {
                            in: ["JavaScript"]
                        }
                    }
                }
            })
        }

        const whereExpected = {
            AND: [
                {
                    OR: [
                        {
                            name: {
                                contains: fulltext
                            }
                        },
                        {
                            full_name: {
                                contains: fulltext
                            }
                        },
                        {
                            description: {
                                contains: fulltext
                            }
                        },
                        {
                            html_url: {
                                contains: fulltext
                            }
                        },
                        {
                            topics: {
                                some: {
                                    value: {
                                        contains: fulltext
                                    }
                                }
                            }
                        },
                        {
                            languages: {
                                some: {
                                    language: {
                                        contains: fulltext
                                    }
                                }
                            }
                        }
                    ]
                },
                {
                    topics: {
                        some: {
                            value: {
                                in: topics
                            }
                        }
                    }
                },
                {
                    languages: {
                        some: {
                            language: {
                                in: ["JavaScript"]
                            }
                        }
                    }
                }
            ]

        }

        const queryBuilder: IQueryBuilderService = new QueryBuilderService([fullTextStub, topicStub, langStub])

        const result = queryBuilder.build({ search: {} })

        expect(fullTextStub.interpret).toHaveBeenCalledTimes(1)
        expect(topicStub.interpret).toHaveBeenCalledTimes(1)
        expect(result).toStrictEqual(whereExpected)
    });
});

