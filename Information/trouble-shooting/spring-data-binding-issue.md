# Spring 데이터 바인딩 트러블슈팅: `@ModelAttribute` vs `@RequestBody`

## 1. 문제 상황
백엔드 API 호출 시 프론트엔드에서는 분명히 `npcId` 파라미터를 보냈음에도 불구하고, 백엔드 컨트롤러DTO에서 해당 값이 `null`로 바인딩되는 현상 발생.

```java
// 로그에서 확인된 DTO 상태
ChatLogRequest(npcId=null, page=1, size=20)
```

## 2. 원인 분석
스프링부트에서 요청 데이터를 객체(DTO)로 변환할 때 사용하는 어노테이션에 따라 **데이터 바인딩 매커니즘**이 완전히 다릅니다.

### 2-1. `@RequestBody` (JSON → 객체)
- **사용처**: 주로 POST/PUT 요청의 Body 데이터 (JSON) 처리
- **담당자**: `HttpMessageConverter` (Jackson 라이브러리)
- **동작 방식**: **Java Reflection** 사용
  1. 기본 생성자(`@NoArgsConstructor`)로 빈 객체 생성
  2. 필드명을 매칭하여 **Reflection으로 값을 직접 주입**
- **특징**: **Setter 메서드가 없어도 바인딩이 가능합니다.** (Getter만 있어도 동작함)

### 2-2. `@ModelAttribute` (Query String / Form Data → 객체)
- **사용처**: 주로 GET 요청의 Query Parameter (`?npcId=1...`) 처리
- **담당자**: `WebDataBinder` (Spring MVC 고유 기능)
- **동작 방식**: **JavaBean 규약** (Setter) 사용
  1. 기본 생성자(`@NoArgsConstructor`)가 있다면, 이를 사용해 빈 객체 먼저 생성
  2. 파라미터 이름(`npcId`)과 일치하는 **Setter 메서드(`setNpcId`)를 찾아 호출**
- **문제점**:
  - DTO에 기본 생성자는 있지만(`@NoArgsConstructor`), **`@Setter`가 없는 경우**, Spring은 값을 넣을 방법("Setter")을 찾지 못해 해당 필드를 pass합니다.
  - 결과적으로 해당 필드는 `null`인 상태로 컨트롤러에 전달됩니다.

## 3. 해결 방법
`@ModelAttribute`를 사용하는 DTO 클래스에는 반드시 **`@Setter`** 어노테이션을 추가해야 합니다.

```java
@Getter
@Setter // <--- 필수 추가
@NoArgsConstructor
@AllArgsConstructor
public class ChatLogRequest {
    private Long npcId;
    private Integer page = 1;
    private Integer size = 20;
}
```

## 4. 요약
| 어노테이션 | 데이터 소스 | 처리 방식 | Setter 필요 여부 |
|:---:|:---:|:---:|:---:|
| **`@RequestBody`** | JSON Body | Reflection (Jackson) | **불필요 (선택)** |
| **`@ModelAttribute`** | Query String | JavaBean Setter | **필수 (기본 생성자 사용 시)** |
