'use strict';

module.exports = {
    'default': {
        CSA: {
            'default': {
                slot_top_listing: {
                    params: {
                        number: 3
                    }
                },
                slot_bottom_listing: {
                    params: {
                        number: 3
                    }
                }
            }
        },
        AFC: {
            'default': {
                slot_side_listing: {
                    params: {
                        number: 1,
                        media: 'flash, image'
                    }
                },
                slot_side_item: {
                    params: {
                        number: 1,
                        media: 'flash, image'
                    }
                },
                slot_top_item: {
                    params: {
                        number: 3,
                        media: 'text'
                    }
                },
                slot_bottom_item: {
                    params: {
                        number: 5,
                        media: 'text'
                    }
                }
            }
        }
    },
    'www.olx.com.ar': {
        CSA: {
            'default': {
                slot_top_listing: {
                    params: {
                        number: 3
                    }
                },
                slot_bottom_listing: {
                    params: {
                        number: 3
                    }
                }
            },
            customs: [{
                categories: [800, 806, 815, 830, 853, 859],
                slot_top_listing: {
                    params: {
                        number: 0
                    }
                }
            },
            {
                categories: [362],
                slot_top_listing: {
                    params: {
                        number: 2
                    }
                }
            },
            {
                categories: ['allresults', 'allresultsig'],
                slot_top_listing: {
                    params: {
                        number: 2
                    }
                }
            }]
        },
        AFC: {
            'default': {
                slot_bottom_item: {
                    params: {
                        number: 5,
                        media: 'text'
                    }
                }
            }
        }
    },
    'www.olx.com.co': {
        CSA: {
            'default': {
                slot_top_listing: {
                    params: {
                        number: 3
                    }
                },
                slot_bottom_listing: {
                    params: {
                        number: 3
                    }
                }
            },
            customs: [{
                categories: [800, 806, 815, 830, 859],
                slot_top_listing: {
                    params: {
                        number: 1
                    }
                }
            },
            {
                categories: [362],
                slot_top_listing: {
                    params: {
                        number: 2
                    }
                }
            },
            {
                categories: ['allresults', 'allresultsig'],
                slot_top_listing: {
                    params: {
                        number: 2
                    }
                }
            }]
        },
        AFC: {
            'default': {
                slot_bottom_item: {
                    params: {
                        number: 5,
                        media: 'text'
                    }
                }
            }
        }
    },
    'group1': {
        CSA: {
            'default': {
                slot_top_listing: {
                    params: {
                        number: 3
                    }
                },
                slot_bottom_listing: {
                    params: {
                        number: 3
                    }
                }
            },
            customs: [{
                categories: [185, 800, 806, 815, 830, 853, 859],
                slot_top_listing: {
                    params: {
                        number: 1
                    }
                }
            },
            {
                categories: [362],
                slot_top_listing: {
                    params: {
                        number: 2
                    }
                }
            },
            {
                categories: ['allresults', 'allresultsig'],
                slot_top_listing: {
                    params: {
                        number: 2
                    }
                }
            }]
        },
        AFC: {
            'default': {
                slot_bottom_item: {
                    params: {
                        number: 5,
                        media: 'text'
                    }
                }
            }
        }
    },
    'group2': {
        CSA: {
            'default': {
                slot_top_listing: {
                    params: {
                        number: 3
                    }
                },
                slot_bottom_listing: {
                    params: {
                        number: 3
                    }
                }
            }
        },
        ADX: {
            'default': {
                slot_side_listing: {
                    params: {
                        number: 1,
                        media: 'flash, image'
                    }
                },
                slot_side_item: {
                    params: {
                        number: 1,
                        media: 'flash, image'
                    }
                }
            }
        },
        AFC: {
            'default': {
                slot_bottom_item: {
                    params: {
                        number: 5,
                        media: 'text'
                    }
                }
            }
        }
    }
};