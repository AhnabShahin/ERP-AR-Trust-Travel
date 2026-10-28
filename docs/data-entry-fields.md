# AR Trust ERP — Data Entry Items & Fields

## User Account
- name
- username
- email
- password
- role
- phone
- nameAr
- department
- avatar

## Staff
- name
- nameAr
- email
- phone
- role
- department
- assignedAirport
- assignedDeskId
- assignedDeskName
- status
- hireDate
- baseSalaryMonthlyQAR
- monthlyServiceTarget
- commissionPerServiceQAR
- emergencyContact

## Driver
- name
- nameAr
- phone
- driverType
- company
- status
- location
- vehicle
- plateNumber
- vehicleType
- fleetVehicleId
- priceQAR
- image
- licenseNumber
- licenseCategory
- experienceYears
- spokenLanguages

## Tour Guide
- name
- nameAr
- phone
- languages
- specialty
- status

## Customer
- name
- nationality
- phone
- email
- vipTier
- passportNo
- specialPreferences
- lastArrivalAirport
- lastFlight
- lastTripDate

## Customer Tier
- name
- nameAr
- discountPercentage
- badgeColor
- minSpendQAR
- description

## Fleet Vehicle (Transport)
- name
- nameAr
- category
- passengers
- luggage
- priceQAR
- rateType
- features
- image
- idealFor
- make
- model
- color
- modelYear
- plateNumber
- ownership
- status
- assignedDriverId
- assignedDriverName
- showOnWebsite

## Transport / Tour Service
- name
- nameAr
- serviceType
- category
- duration
- priceQAR
- description
- descriptionAr
- pickupLocation
- includes
- image
- badge
- groupSize
- departure
- originalPriceQAR
- isMultiDay
- days
- nights
- highlights
- excluded
- isFeatured
- showOnWebsite

## Service Category
- name
- nameAr
- serviceType

## Hotel
- name
- nameAr
- locationZone
- starRating
- contactPerson
- contactPhone
- contactEmail
- address
- commissionRate
- desks
- roomOptions
- amenities
- contractStatus
- imageUrl
- notes

## Hotel Booking
- confirmationCode
- hotelId
- hotelName
- hotelLocation
- guestName
- guestPhone
- guestEmail
- guestNationality
- roomType
- roomsCount
- paxAdults
- paxChildren
- checkInDate
- checkOutDate
- nights
- mealPlan
- ratePerNightQAR
- totalQAR
- commissionRate
- commissionEarnedQAR
- bookingSource
- deskCode
- agentName
- paymentMethod
- paymentStatus
- bookingStatus
- specialRequests
- voucherSent

## Location
- name
- nameAr
- type
- code
- city
- address
- hotelVendorId
- active

## Desk
- locationId
- airportCode
- airportName
- deskCode
- deskName
- deskNameAr
- terminal
- zone
- assignedEmployeeId
- assignedEmployeeName
- assignedEmployeeRole
- status
- shiftTiming
- phoneExt
- operatingHours
- dailyTargetQAR
- currentDrawerCashQAR
- deskType
- hotelVendorId
- hotelName
- notes

## Desk Assignment
- deskId
- deskCode
- deskName
- airportCode
- terminal
- employeeId
- employeeName
- employeeRole
- assignedDate
- shiftTiming
- assignedBy
- status
- notes

## Booking / Trip
- pnr
- passengerName
- passengerPhone
- passengerEmail
- nationality
- flightNumber
- arrivalAirport
- arrivalTime
- terminalGate
- pickupBay
- packageId
- packageName
- packageNameAr
- paxCount
- totalQAR
- paymentCurrency
- paymentMethod
- source
- leadType
- serviceType
- customerId
- driverId
- driverName
- driverPhone
- driverVehicle
- guideId
- guideName
- vehicleId
- vehicleName
- vehiclePlate
- deskId
- deskCode
- bookingDate
- bookingTime
- tripStatus
- scheduledStart
- scheduledEnd
- voucherSent
- notes

## Invoice
- customerId
- customerName
- customerPhone
- customerEmail
- customerAddress
- customerTRN
- invoiceDate
- dueDate
- currency
- items
- discount
- notes
- terms
- source
- bookingId
- bookingPnr

## Invoice Payment
- date
- method
- accountId
- note
- amount

## Payment Account
- title
- openingDate
- accountNumber
- currency
- openingBalance
- note
- isActive
- sortOrder

## Expense
- date
- category
- description
- amountQAR
- status
- paymentMethod
- department
- requestedBy
- requestedByRole
- submittedBy
- approvedBy
- receiptRef
- receiptNumber
- merchant
- deskId
- deskName
- notes

## Currency
- code
- name
- symbol
- rateToQAR
- isPegged
- peggedNote
- bankAccount
- cashVaultBalance

## Commission Rule
- targetRole
- ruleDescription
- type
- rateValue
- unit
- appliesTo

## Salary Record
- employeeName
- roleTitle
- department
- fixedBaseMonthlyQAR
- accruedCommissionQAR
- netPayableQAR
- paymentCycle
- payoutStatus

## OTA Platform
- name
- type
- contactPhone
- website
- notes
- isActive
- sortOrder

## Review
- author
- country
- rating
- date
- tour
- comment
- avatar
- showOnWebsite
- sortOrder
