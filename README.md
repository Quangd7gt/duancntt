README 
1. Domain Layer
Tạo class Location để lưu thông tin:
latitude (vĩ độ)
longitude (kinh độ)
2. Infrastructure Layer
Tạo GpsAdapter để giả lập dữ liệu GPS.
3. Application Layer
Tạo interface GpsService và class GpsServiceImpl.
4. Exception Layer
Cấu trúc thư mục
main/java/com/example/qlsv
 ├── application
 │    ├── service
 │    │    └── GpsService.java
 │    ├── impl
 │    │    └── GpsServiceImpl.java
 │    ├── exception
 │    │    └── GpsException.java
 ├── domain
 │    └── Location.java
 ├── infrastructure
 │    └── GpsAdapter.java
 └── repository
      └── LocationRepository.java (nếu ông muốn lưu dưx liệu vào database)
   
5.Tạo class Location trong domain.
Viết GpsAdapter để giả lập dữ liệu GPS.
Tạo interface GpsService và class GpsServiceImpl.
Viết test đơn giản để in ra vị trí hiện tại.
