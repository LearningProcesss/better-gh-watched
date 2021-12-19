import db from "db";

describe('Prisma concrete query test', () => {
    it('should get repo by fulltext', async () => {

        const fulltext = "rest"

        const repos = await db.githubRepo.findMany({
            include: {
                languages: true,
                topics: true
            },
            where: {
                // AND: {
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
                ],
                // AND: [
                //     {
                //         languages: {
                //             some: {
                //                 language: {
                //                     in: ["JavaScript"]
                //                 }
                //             }
                //         }
                //     },
                //     {
                //         topics: {
                //             some: {
                //                 value: {
                //                     in: ["rest"]
                //                 }
                //             }
                //         }
                //     }
                // ]
                // }
            }
        })

        expect(repos.length).toBeGreaterThan(0)

    });
    it('should get repo by language', async () => {

        const repos = await db.githubRepo.findMany({
            include: {
                languages: true,
                topics: true
            },
            where: {
                languages: {
                    some: {
                        language: {
                            in: ["JavaScript"]
                        }
                    }
                }
            }
        })

        expect(repos.length).toBeGreaterThan(0)

    });
    it('should get repo by topic', async () => {

        const repos = await db.githubRepo.findMany({
            include: {
                languages: true,
                topics: true
            },
            where: {
                topics: {
                    some: {
                        value: {
                            in: ["rest"]
                        }
                    }
                }
            }
        })

        expect(repos.length).toBeGreaterThan(0)

    });
    it('should get repo by language AND topic', async () => {

        const repos = await db.githubRepo.findMany({
            include: {
                languages: true,
                topics: true
            },
            where: {
                AND: [
                    {
                        topics: {
                            some: {
                                value: {
                                    in: ["rest"]
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
        })

        expect(repos.length).toBeGreaterThan(0)

    });
    it('should get repo by fulltext AND language AND topic', async () => {

        const fulltext = "node"

        const repos = await db.githubRepo.findMany({
            include: {
                languages: true,
                topics: true
            },
            where: {
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
                                    in: ["rest"]
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
        })

        expect(repos.length).toBeGreaterThan(0)

    });
    it('should get repo by fulltext AND language AND topic order by id desc', async () => {

        const fulltext = "node"

        const repos = await db.githubRepo.findMany({
            include: {
                languages: true,
                topics: true
            },
            where: {
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
                                    in: ["rest"]
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
            },
            orderBy: {
                id: "desc"
            }
        })
        expect(repos.length).toBeGreaterThan(0)
    });
});
