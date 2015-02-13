module.exports = {
    categoryTree: {
        order: [185, 186, 362, 187, 16, 191, 190]
    },
    successPage: {
        keepPosting: [
            {
                category: '185',
                subcategory: '228',
                icon: '806',
                name: 'Hogar y Jardín'
            },
            {
                category: '185',
                subcategory: '366',
                icon: '800',
                name: 'Electrónica'
            },
            {
                category: '185',
                subcategory: '219',
                icon: '830',
                name: 'Móviles'
            }
        ]
    },
    testimonials: [
        {
            name: 'María de Santa Cruz',
            testimonial: 'Vendí una bicicleta que ya no usaba, ¡lo mejor fue que no pagué comisión!',
            image: '/images/desktop/maria.jpg',
        },
        {
            name: 'Raúl de La Paz',
            testimonial: '¡Publiqué un celular a la mañana y al día siguiente ya lo había vendido!',
            image: '/images/desktop/raul.jpg',
        }
    ],
    tracking: {
        trackers: {
            hydra: {
                enabled: false
            },
            ati: {
                enabled: true,
                server: {
                    enabled: true,
                    platforms: ['html5', 'html4', 'wap'],
                    event: true
                },
                client: {
                    enabled: true,
                    platforms: ['html5']
                }
            },
            analytics: {
                enabled: true,
                server: {
                    enabled: true,
                    platforms: ['html5', 'html4', 'wap'],
                    event: true
                },
                client: {
                    enabled: true,
                    platforms: ['html5']
                }
            },
            ninja: {
                enabled: true
            }
        }
    }
};
