mainApp.service('bookingService', ['$q', 'dbService', 'errorService', 'idGenerator', function ($q, dbService, errorService, idGenerator) {
    var service = this;
    const ITEMS_PER_PAGE = 5;
    const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

    /*Functions available 
    CreateBooking(used for accepting the bid)
    CheckCarAvailibility
    UpdateBookingStatus,
    GetUserBookings
    CancelBooking
    SubmitRating
    */

    // service.injectTestBooking = function(){
    //     var deferred = $q.defer();
    //     const testBooking =   {
    //         "bookingId": "2563531335",
    //         "fromTimestamp": "2025-02-19",
    //         "toTimestamp": "2025-02-20",
    //         "status": "confirmed",
    //         "createdAt": "2025-02-15T14:25:31.335Z",
    //         "rentalType": "outstation",
    //         "bid": {
    //           "bidId": "8130520849",
    //           "fromTimestamp": "2025-02-19",
    //           "toTimestamp": "2025-02-20",
    //           "status": "accepted",
    //           "createdAt": "2025-02-15T14:25:20.849Z",
    //           "bidAmount": 455,
    //           "rentalType": "outstation",
    //           "bidBaseFare": 455,
    //           "user": {
    //             "userId": "6970829960",
    //             "username": "Vaibhav",
    //             "email": "rushukla7@gmail.com",
    //             "role": "customer",
    //             "paymentPreference": "",
    //             "avgRating": 0,
    //             "ratingCount": 0
    //           },
    //           "car": {
    //             "carId": "5284836230",
    //             "owner": {
    //               "userId": "9050611811",
    //               "username": "Olivia",
    //               "email": "olivia@example.com",
    //               "role": "owner",
    //               "isApproved": true,
    //               "avgRating": 0,
    //               "ratingCount": 0,
    //               "paymentPreference": ""
    //             },
    //             "carName": "Kia Seltos",
    //             "category": {
    //               "categoryId": "9945210358",
    //               "categoryName": "SUV"
    //             },
    //             "city": "Delhi",
    //             "description": "A car by KIA",
    //             "images": [
    //               "data:image/jpeg;base64,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",
    //               "data:image/jpeg;base64,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",
    //               "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUREhMWExUWFRUYGBcYFhoaFxUVFRgWFhcVGRgbHSggGBolHhcYITEhJSkrLy4uGCAzODMtNygtLisBCgoKDg0OGxAQGi4lHyUtLS0tLTYvLys1Ly0rKy0rLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKy0tLS0tLS0tLv/AABEIALsBDgMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABQYDBAcCAQj/xABIEAABAwIDAwgGBAsHBQAAAAABAAIDBBESITEFBkEHEyJRYXGBkTJCUqGxwRRigtEVIzNDcpKissLS4RZTY4Pi8PEXRISTw//EABgBAQEBAQEAAAAAAAAAAAAAAAABAgME/8QAJBEBAQACAQMEAgMAAAAAAAAAAAECEQMSITFBUWGhEyIjMlL/2gAMAwEAAhEDEQA/AO4oiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICKK25vBBStvI67iLtjbm93cOA+sbDtXMd5d/JpLtxc0z2GOP7TxYuPYLDPQ6oOq1+14YQeckAI9UdJ36rbk+SqtZyjsabMpKh49omKMftSYvcufwbErp2Y2MLGnQPfgJ7cOtu9VPawmhkMcocxwzsTwOhyPHVdJ+P139M7t8adnbyls9aDD/AJzD8FlPKdSgZg37xbzXBQ97iADmTYdIDM9pNh4qSduxXWDhTyOBFwW2cD3FpN1rfF7U7+tdidyqUvsu8/6LH/1WpvZcuI1NBNH+Vjkj4dNjm3PULjNYmsKdXH/n7NX3d0dyrUvBpPebfIqPr+V1gcGxxADi4kvI7mANue9wXFa2Xm26m50UvsLY2BmN46b9b+qNQ3v61m5Yek+11XRpuVeS/wCLsR9eKxv2APNh4lZYOVSXiyE+EjfhdUtuzx1D9Vv3LJHs5huC0XvrhF88xw7wnVh7fZquiUvKg0+nCD+hKP4w1TNLygUrvSbKz7GIebC5cnGx29nv+Tgsg2O4ZtcfA2+IPxT+P5P2duoNvU035KZjuFr2IPUQdCpJcFhErDzjDj01aL2F8iDkbG/RParjsTlAc1oErGuY3IlgwlrRr0dLgerYaK/j3N43adWvLpKLzG8EBwNwQCCNCDoV6XJoREQEREBERAREQEREBERARFDb17dFJAZcifVubDvPZ2doVk3dFTKoe9O/obeKkIcRk6bVjesRjR7u30R9bMKl7U3vrKhjmzvDInfmmNwlzep59Kx9m+fHqWhsTZL6xxJdzUDTZz7gE29VgPHt0HuUvZLe23yEz1cpbCDI8m75HEkD6z3n3DwAV12DupDT2e/8dL7bhk0/Ub6vfqtykmpKZjYmSQxt4AyNBJ4kkm7j2rSrN7YRJzUI+kPABOB8YYAdOm5wBPYLqONyt8JqvrGxRvlf6LGlx8OHedFwTade6WR8z83PcXHs6gOwCw8Fe9+d5OdgFO1j43FwMjXW9FubQCCQ4E55eyqpuvRNlrIWPIDcYJvpZgL7eOG3iq3xzU3UptncxtLStqJZSXuDQIgwD8Y4XwlxJyFjfLOy+bu73z0wii6BgYc24elhc4l1nX1zJVt5RImTRRgTwtwPLiHSAXBFrjXTPzVAipm+2zz17Rloi4/tO678p8rXRwMBuS4vH6OGwPjf3KEr6Klj2ZDK4YZiXm41cA9wdi6wBYDtt2rDPik5sOOIMjaxpHstvYe9VPeWuMrxTRklrPSN8r62HYCT4kosx1Iy7s7PNVMZ3DoMPRHAu1Hlr32V7ZQqq7N2wylp8LRcufbLI2AuXeJIzX2m3lkeSImvJGec5H77rLrjx9U3vS2up7A2dE+Ih0bcQuCSLkg6G50/oq3PSlj+9vvY7/UvW4e2qiSR8MuFri3E0tkjc8gWuHBjicr62U5vFS4RG88Xlpv9Zjj/AArnZqpjFjoIw+Njw0dJoOg14rNU7ObI0tI7jbQ8CordyqLoGta62EkcLm/SHxU0wvGZd56KM9FUySi5qazhZr73FtHNIDvMEHwPWtqfZEcUgkMbH3Ia5hAtI020PtW0PgclLb3uhLWObJGHteCQXtb0bFpuSQNHX8FS6/bgccIeCLWxZgWtYtaDnbrcbE6WAvi6YYZZXs1cpJ3dU2JtSKZrmx6RnCB1tGTXDsy9yk1yPd7bwhkDgewjrbxC6tSVLZGB7DiaRkfl2Fa5eLovbwmGW/LMiIuLYiIgIiICIiAsNTVMjGJ7g0dptfu61Hbw7VdDGREA+Xo9G4uGk2L8NxitY5DMrju3tt1r3k83J3lj7nzbkOwWC68fHMu+V0zllZ4jrdVvZTs0xPP1R/MQtF++fs07vtOA9wBXEZNq1w/vB3MP3L63acxAxvqr8bMyvnaxPh7/AB9Mw4J8ue866/U731ByZGxnaTmPj8FXdpzSVBaah8b8Bu0OxOwutbEBkAbcbLnM1fPlhNRpniadewAaeK8Crqv8fwjef4V1xy4p4kZuOV81e3bMhPpc2e6MfO6xybEpyLkADrwMA88Kpsb6o6Mqj3QSn+FbLNmVD/Sp61//AI0pHvbZa/Jx/CdGXu3auGiBwsvK7qZGx3vssTdnE58zGwf4giBt3YSVmZsSpbl9FqwPrYIx+1IE/A83GnA7ZKqmH/1JWbycfwvTWu6nYNTCP0Wj5H5LVqjEPWB8D8gt7aWypIheV1NCL26Uzjn1dCM59i+f2Rnc0PJwtIJDjE9oIBtf8bgyz1WMuXjamNV2cQezi+z95CwOljtYMPnb3ZqTq9nwR5Omxn6rm/LEtACC+Zk7hb42z8lmZ45eJ9Na0wiqcBZpLQQRkTmDqvDZmxtOFgvxPHzUrTtp+ETnd7j8lJMpI3Cwp2eIv8VLjKnVpUoNpvmIbI69vRBANh2XC344AevwA+5WenoiB0Io2ZcGAfJfZGW9ORje9zQsTikOtG7Irpae5iOEuFicLSSNeINvBSP9oas/n3juIb+6AtWSspW+lURnuOL9261KzeilZGWxxRVD7gt56Eua06E2Nr5aAghbsxxnaEtqSO0ah2TppSO2R518V45t7vvJUQ7fZpALocT7ZkYI2X6mtY3Ie9YH78v9WCMd5cfuVmWOmbKsB2bJa4ezuuR8lids2pB/IHBa/Oudhi7sZGZ7lXv7cVHBkI+wf5lKbI2/DUPa+qIjkjHQONwiIN79EkgOz8fBLlv+tPHlINp6sHoxRH/O/wBIWy3fCv2eR0WXcL2xFzCAbaXGiO2/StOdQzXhc/AKK3s2lBO2PmpA/CJMRHAHDbxyOScmPXjrbfFydGW7H6bhfdoPWAfML2sVMRgbY3GEWPWLLKvC6CIiAiIgIi0tsbRbTxOlfwsAOtxyAVk3dDlPKbWwPmfDMxzfxrSJB0mubG2xAaXtAc0keaptPS0RcXDaLmNLX9F9LK3ItIvdl7W1BB9Vb/KFO4uikJ/KCc3va7uc6VgDoMhbPQLnIqH5tu3IE3aBiyub63Iy6ks1dJLtbWbwTwfioaoTxtvhdzYOLMnWQF47rG2i9DfOsyu9jRxJiaP4fgqdHVPIcMZcLXI45EG+YANrX8F4gnJPROYzvkA23EkKKujduVVS7mnVsdOzMl7rxXHAXjDn3PUPFe6uneCGt2tGABmfpNVcu43BYCO6ypMVS7EDjGvBguTwHojVZXVDnG2Brc883gDr9awQXD6OcIx7V1NwRJVno6ZAR558brFFsoS2BrjcnJpE0jnC5AIB67ad4VcdKHkm5cTpmCO7POwV33UpI6FjdpVhc04X/RKdtzJKXAtdMGcIwHGxyBJBvpcPezW0lDDJFO6Qumex2N1K5pIjuQ0Bz883aixzCkWb7UogZSgSODDcEsjY7Mh1uk51hkOF1V9vbxR1MzZZ45AGtIY27bnFe7r5gcBbNa8e2YG5spXPPtOzJPWXYL+9XpvsbXmr33fPIzmaZgmc9jGSvwyyB7ug3AC0NY43texOZVY333gqJpXUxmMrYCYi4XwyOYTifmSScRIuerIBRkW8NQXMEZMLmno4XElpsW3Ava/SNrgWOfBYaysiphh/KS+zfIHreevs1XXDD1rNrSfS4W85I4Mb1nUnqA4lYoXvd+ShJHBzza/bhFviV5o/xjjUTm4Gg4ZdQ0A/qVnm3ndmIuiPq5e/UplyX0JGxHPVR9IwRkdWY95clVvlLYsZE2E6E5ucO6+Q8itFm8k9/Td+uT7jkse0CJmc4AA5utha44j5qY8uRcY0anaEr83yPd3uNvLRat18W9S0GIAm+a1bU00rr5dSrqaNuth3la0j4uAv7lkad0Xp5B0Fl5TuoslPGXODW6n3dqxqT2SMLXP46D/ff8Et0aStPsWnDQZpel1BriR3gEAd1ytaroI2EPhfibxFiMuORvbzKxu2W9wxOkY0nMNebE92th3rXpnFriw8bgjtXOZXa6fq/cWs57Z9LJqTCwHvYMB97Sp1UfkZkvsqEE3IdKO7puNvIjzV4S+VgiIoCIiAuZ8s4fIKeCOTAbvkORtduFrHEj0R0nLpi41y2xubVwytJaTTOAINrGOUHr/xFZdVK51tjeaVhbS11NHKYMWAtc5hGPpEg5tN+u3wVn3e5PvpUEdfBHG0yAuYyWd7mNIcW3c1sQxeiejitnnfRUZm0ZcLGl5OXGxt4ELou7PKjDSU0dNLA9zow4EsdGAcTnOHRNrapburGo3k/wBoNJcx+zegcJPNMGE6WJ5sWOdvFe37gbV4w0Dx+iBfyAW3UcoGzZnl74qu7iSQBEWjEG36IOfoDM3J8BaS2byibNhcXA1IxXFjECBcg+qeFvG5JvkoKvt3dEU9Jz1ZStpZGPwiamcHMcJMgHROfcOByu3h1KhtbQtdfnp3W4fR49fGVdS5Rd+qKsoTBC57nmSJ2F0bmjC113XPDJcwEEX9yP1n/wAyvYbdJtekhs+OOaokBuOfDRG064jGxx5w9jjbsK9T7yySyGWSJ00jrXfI7MgaAANDWgcABktF9UyIAsiABPaT5lfYtu52wgeF/mt45a8M2bTLquNwxtxNcRmCHEjs4hRVUx7vbPg5bMO2L5C36rv51sbUqpYoYpxhIk5wWbiBbzeC9y69/TGnUtfktTSLdVCGPoEGV9xcfmxoT2O4BQ0bS5wHWf8AkqQ2g3G3GMzr33XnZdKcWI9XxUue4uu7alZe0YGWWXwUrszdoy3EcLpnAG+CzQLZm7iQL2WtQtFy85DM3Goa0XJHbYZdtltjbboKuhrYwWsETSWAktAa98Uze29rk8S665NIna+xxH0mBwyuWuzNjo5rhk5vaFrbPPSt1gq/bZ2dBG6SkY/nXyONREAejTxSDGyK3Fz8ViNAGsOpVBp22kA+sPegjZmWJHUSFkfVOItew6hkt3bFN0gQCbngO6ymti7tRYQ+okAJzwakDt7V12yqSzxUUjtGOPgbea6HHT0cegLvd8AF6dtKFvoxDvIHxN038CiRbEmd6oHefuuttm7T/WdbuafnZWKq2/fIYRYg+l4aC3WtY15f2/YJ95BTdEP+Box6TnHuss1NTAENAyuTbrzyHmVKukNtT7h7slr0EjRUNxMxtaQ5zPaw3fg8cgsZVYlt3dpuMxpo3ANqqV4YXWDfpMbnYXuNvRJiIscg11lBbepYxOx0JvG+xabWvwJA4NuCQOAIUxW1ZqBj5oRuDZY4w0WZECdALXLrEnCOJB7FvbM2O2pqtnbOaHN5nFzrzm442GocT1ZFrQDpdZV1TkXp5GbPu/R0zyz9ANYz4tcr4sNHSsiY2KMYWMaGtA4AZLMgIiICIiAuZctWznPbTyt4GSMi3t4HDu9BdNWntXZrKiPm33tcG4tcEd/+81YPy7tzZoiEb23tc3vbI8RkO4+KhK6mLnFwDCDbU58NbLv+9+6L4IDLSNfM/ELxhoPRsbusBc8PNcmrttytc5kkDGuBsWvjs4HWxBAIUFa2fSFrruaBlkQTr5rY2iy7CNdMlInbA9algPc0j4FfDtSE60jfB7ggrLYHA+g8fa/ovmF3VJ5/0Vo/CNKdaZw7pXL19Mo/7qUd0h+aDQg2LLURAsbfIauaHXGXok3ce4LX2bsL8YWzO5u3Di/XRWmn2xTABoLmgZC4W1NLSzjDJKD9bLEPM9Lx81qXSVWvwMGE4HXHbY/cpLaDmuoImF7XOZLL0MZLg17GdLAfRBLNeN1HVlEI3FuPI6EOaQR2E3IWBsLBxJ8fuS69Duw0lOQ3Dqtjm8LSexZRK3rAWvWzg2aDfPP5KbVObougxPNQznGNiNmEZOcOnn2WYVsVta2rwc5HzTIn2axjcQa1rw5zWuA6TbixBsG3BGRsse5L4GvkNTiwCO/R1ve3WOBI8VLbZpKemdGYGmWKocxxJ6LmmRj3YDqbZjQ6sdc6Wghd1TzFa/aNUBhhxOEd8i8gxwtdlk0G1ri/RCrVQA2oA0GIeAH/AApzYNa6XnqOoL3xl3ScBm3mySyT7JGhOYJ45qJmhDpTI4gA52B6XdoQEG6Ki/oi/asM0725l2Hyv81t0tZSM9KlEn6U8ufg0tHuUtSb1UkdsOzaTLi6PGfN9yU2KoawHIvcT1Yrfu2W7S7Nml/J0ksvaIZH++xV4pOVN0YtHTwRjqZG1vwC3mcsM/st8k2KvR7mbUdkyglb+lgjH7TgpaDkz2u7IxxMHW+YfwBym4+WCXixvktqLlePFjfJByTbXOUtTLTS4TJE7CS0nCTYG4JFyM+xfN26wsqI5ARiD7gm9sRuATYg2ueBXQ9997abaFK+F7Y45Lh7JMgRI3S56iLtPeuQxVGE9x60HRt4J6irmbDZrJJNnxTOa24xSvwPGbjcOyZqeNrq+ckFATJLNIwB8UTIiS2zsTiXOB7Q1rPAhcxh2wyrcAWvkq5BBGMDwMYgtgytdp6LLkH1L5L9B7mbINLTNjccUriZJXe1K/N1jxAyaOxqCdREQEREBERAREQFzblW5PPpw+lUxa2oa2zmuOFszRpd3qvHA6HQ8COkELUqdnh+pKD8e7S2fPC9zJI3sc02I1F+xzbg+BWqap+l3eXzX6zrN0mP4+5QlXycMdph8kHNOT2l2RHGZNpVDJ5XjKIYsMQ1zcLYnnyCsVUd2zpCfsySj+NSVTyWX0so2fkqk4AIIarbsD1IZvCd/wAyVC1f4K9SOcf5o+bVZJuSyfg1acnJhU+wUFSmfRD0Wy+Mg/lWnJPT8GP8Xf0VwfyZ1PsHyWI8mlV/dnyQU4VUYILWHIgjO+ngtV813Od1uJ8zdXg8mlZwiusU/JntAizafPgb2QV3Z8zblr74HtLHW1wu4jtBs4drQrfvZc7RimjJfTRQU8jXtvgc2lhEhtwuXDB13JHWolvJrtcaUjj3PZ83BTOy9xtuAFjIXQg63qGNb4hryfcgi9o1rZGh/Mc1Uy3xAZAg6uLdcxkL5261EQ7Bld6pXbdz+TIQNx1ThJO7NxBJDfqtvr2k5lXKn3dgZowIPzlS7lzO9U+SmaPk1md6q/QUdFG3Ro8lmDANAg4pR8k7j6Sm6TknjHpFdSRBRqXk0pW6i6lafcmkb+aBVkRBEx7t0o/MR+LQVmGwqUf9vD/62/cpBEGvT0UTPQjYz9FoHwC2ERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREH/9k="
    //             ],
    //             "isAvailableForLocal": true,
    //             "isAvailableForOutstation": true,
    //             "avgRating": 4.1,
    //             "ratingCount": 10,
    //             "createdAt": "2025-02-15T14:22:58.881Z",
    //             "featured": [
    //               "1.5L",
    //               "Manual",
    //               "Turbo"
    //             ],
    //             "carType": "Automatic",
    //             "rentalOptions": {
    //               "local": {
    //                 "pricePerHour": 76,
    //                 "maxKmPerHour": 60,
    //                 "extraHourRate": 80,
    //                 "extraKmRate": 17
    //               },
    //               "outstation": {
    //                 "pricePerDay": 455,
    //                 "pricePerKm": 20,
    //                 "minimumKmChargeable": 200,
    //                 "maxKmLimitPerDay": 300,
    //                 "extraDayRate": 497,
    //                 "extraHourlyRate": 52,
    //                 "extraKmRate": 14
    //               }
    //             }
    //           }
    //         },
    //         "baseFare": 455,
    //         "extraKmCharges": 0,
    //         "extraHourCharges": 0,
    //         "totalFare": "910.00"
    //       }
    //       dbService.addItem('bookings',testBooking).then(function(){
    //         errorService.success('Test bookking created sucessfully');
    //         deferred.resolve(testBooking);
    //       }).catch(function(error){
    //         // errorService.error('Error injecting testBooking');
    //         deferred.reject(error);
    //       })
    //       return deferred.promise;
    // }

   

    function calculateBaseFare(bookingData) {
        const rentalType = bookingData.bid.rentalType;
        const car = bookingData.bid.car;
        const from = new Date(bookingData.fromTimestamp);
        const to = new Date(bookingData.toTimestamp);
        const diffTime = Math.abs(to - from);

        if (rentalType === 'local') {
            const totalHours = diffTime / (1000 * 60 * 60);
            return car.rentalOptions.local.pricePerHour * totalHours;
        } else if (rentalType === 'outstation') {
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return car.rentalOptions.outstation.pricePerDay * diffDays;
        }
        return 0;
    };

    function calculateTotalAmount(bookingData) {
        const baseFare = calculateBaseFare(bookingData);
        const extraKmCharges = bookingData.extraKmCharges || 0;
        const extraHourCharges = bookingData.extraHourCharges || 0;
        return baseFare + extraKmCharges + extraHourCharges;
    };

    function applyFilterConditions(booking, filters) {
        if (!filters) return true;

        if (filters.searchCar && !booking.bid.car.carName.toLowerCase().includes(filters.searchCar.toLowerCase())) return false;
        if (filters.startDate && new Date(booking.fromTimestamp) < new Date(filters.startDate)) return false;
        if (filters.endDate && new Date(booking.toTimestamp) > new Date(filters.endDate)) return false;
        if (filters.maxAmount && booking.bid.bidAmount > filters.maxAmount) return false;

        const currentDate = new Date();
        const bookingStartDate = new Date(booking.fromTimestamp);
        const bookingEndDate = new Date(booking.toTimestamp);

        if (filters.status) {
            if (filters.status === "cancelled" && booking.status !== "cancelled") return false;
            if (filters.status === "active" && (booking.status === "cancelled" || bookingEndDate < currentDate)) return false;
            if (filters.status === "past" && (bookingEndDate >= currentDate || booking.status === "cancelled")) return false;
        }

        return true;
    };

    service.createBooking = function (bookingData) {
        var deferred = $q.defer();

        try {
            // Validate required fields and structure
            if (!bookingData.bid || !bookingData.fromTimestamp || !bookingData.toTimestamp) {
                throw new Error('Missing required booking information');
            }

            if (!bookingData.bid.bidId || !bookingData.bid.user || !bookingData.bid.car) {
                throw new Error('Invalid bid information');
            }

            service.checkCarAvailability(
                bookingData.bid.car.carId,
                bookingData.fromTimestamp,
                bookingData.toTimestamp
            ).then(function (isAvailable) {
                if (!isAvailable) {
                    throw new Error('Car is not available for selected dates');
                }

                const booking = {
                    bookingId: idGenerator.generate(),
                    fromTimestamp: bookingData.fromTimestamp,
                    toTimestamp: bookingData.toTimestamp,
                    status: 'confirmed',
                    createdAt: new Date().toISOString(),
                    rentalType: bookingData.bid.rentalType,
                    bid: {
                        bidId: bookingData.bid.bidId,
                        fromTimestamp: bookingData.bid.fromTimestamp,
                        toTimestamp: bookingData.bid.toTimestamp,
                        status: bookingData.bid.status,
                        createdAt: bookingData.bid.createdAt,
                        bidAmount: bookingData.bid.bidAmount,
                        rentalType: bookingData.bid.rentalType,
                        bidBaseFare: bookingData.bid.bidBaseFare,
                        user: bookingData.bid.user,
                        car: bookingData.bid.car
                    },
                    baseFare: calculateBaseFare(bookingData),
                    extraKmCharges: 0,
                    extraHourCharges: 0,
                    totalFare: calculateTotalAmount(bookingData)
                };

                const carAvailability = {
                    carId: bookingData.bid.car.carId,
                    fromTimestamp: new Date(bookingData.fromTimestamp),
                    toTimestamp: new Date(bookingData.toTimestamp)
                };

                return Promise.all([
                    dbService.saveItem('bookings', booking),
                    dbService.saveItem('carAvailability', carAvailability)
                ]).then(function () {
                    errorService.success('Booking created successfully!');
                    deferred.resolve(booking);
                });
            })
                .catch(function (error) {
                    errorService.handleError('Error creating booking: ' + error.message);
                    deferred.reject(error);
                });
        } catch (error) {
            errorService.handleError('Error creating booking: ' + error.message);
            deferred.reject(error);
        }

        return deferred.promise;
    };

    service.updateBookingStatus = function (bookingId, newStatus) {
        var deferred = $q.defer();

        if (!VALID_STATUSES.includes(newStatus)) {
            deferred.reject(new Error('Invalid status'));
            return deferred.promise;
        }

        dbService.getItemByKey('bookings', bookingId)
            .then(function (booking) {
                booking.status = newStatus;
                return dbService.updateItem('bookings', booking);
            })
            .then(function () {
                errorService.success('Booking status updated successfully!');
                deferred.resolve();
            })
            .catch(function (error) {
                errorService.handleError('Error updating booking status');
                deferred.reject(error);
            });

        return deferred.promise;
    };

    service.checkCarAvailability = function (carId, fromTimestamp, toTimestamp) {
        var deferred = $q.defer();

        dbService.getItems('carAvailability')
            .then(function (availabilities) {
                const carAvailabilities = availabilities.filter(
                    availability => availability.carId === carId
                );

                const isOverlapping = carAvailabilities.some(function (availability) {
                    const existingFrom = new Date(availability.fromTimestamp);
                    const existingTo = new Date(availability.toTimestamp);
                    const newFrom = new Date(fromTimestamp);
                    const newTo = new Date(toTimestamp);

                    return (
                        (newFrom >= existingFrom && newFrom <= existingTo) || // New start date falls within existing booking
                        (newTo >= existingFrom && newTo <= existingTo) || // New end date falls within existing booking
                        (newFrom <= existingFrom && newTo >= existingTo) // New booking completely encompasses existing booking
                    );
                });

                deferred.resolve(!isOverlapping);
            })
            .catch(function (error) {
                errorService.handleError('Error checking car availability');
                deferred.reject(error);
            });

        return deferred.promise;
    };

    service.getUserBookings = function (userId, page, filters) {
        var deferred = $q.defer();

        if (!userId) {
            deferred.reject(new Error('User ID is required'));
            return deferred.promise;
        }

        dbService.getItemsWithPagination('bookings', page, ITEMS_PER_PAGE)
            .then(function (bookings) {
                const filteredBookings = bookings.filter(function (booking) {
                    return booking.bid.user.userId === userId && applyFilterConditions(booking, filters);
                });
                deferred.resolve(filteredBookings);
            })
            .catch(function (error) {
                errorService.handleError('Error fetching bookings', 'error');
                deferred.reject(error);
            });

        return deferred.promise;
    };

    service.cancelBooking = function (bookingId) {
        var deferred = $q.defer();

        dbService.getItemByKey('bookings', bookingId)
            .then(function (booking) {
                booking.status = 'cancelled';
                return Promise.all([
                    dbService.updateItem('bookings', booking),
                    dbService.deleteItemByQuery('carAvailability', { carId: booking.bid.car.carId })
                ]);
            })
            .then(function () {
                errorService.success('Booking cancelled successfully!');
                deferred.resolve();
            })
            .catch(function (error) {
                errorService.error('Error cancelling booking', 'error');
                deferred.reject(error);
            });

        return deferred.promise;
    };

    service.submitRating = function (carId, rating) {
        var deferred = $q.defer();

        dbService.getItemByKey('cars', carId)
            .then(function (car) {
                car.ratingCount = car.ratingCount ? car.ratingCount + 1 : 1;
                car.avgRating = ((car.avgRating * (car.ratingCount - 1)) + rating) / car.ratingCount;
                return dbService.updateItem('cars', car);
            })
            .then(function () {
                errorService.success('Rating submitted successfully!');
                deferred.resolve();
            })
            .catch(function (error) {
                errorService.error('Error submitting rating', 'error');
                deferred.reject(error);
            });

        return deferred.promise;
    };

    return service;
}]);