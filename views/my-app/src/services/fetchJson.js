// [Tác dụng file] Hàm gọi API theo action và trả về JSON (có cơ chế "cứu hộ" nếu response lẫn HTML)
const API_BASE = "http://localhost:3000/public/index.php";

export default async function fetchJson(action, options) {
  // [Tác dụng] Ghép URL với action và hợp nhất các tuỳ chọn fetch
  if (!options) options = {};
  let url = API_BASE + "?action=" + action;

  // [Tác dụng] Gộp header mặc định + header truyền vào
  let headers = { Accept: "application/json" };
  if (options.headers) {
    for (let hk in options.headers) {
      if (Object.prototype.hasOwnProperty.call(options.headers, hk)) {
        headers[hk] = options.headers[hk];
      }
    }
  }

  // [Tác dụng] Tạo fetchOptions (giữ cookie), copy các option khác trừ headers
  let fetchOptions = { credentials: "include", headers: headers };
  for (let ok in options) {
    if (ok !== "headers" && Object.prototype.hasOwnProperty.call(options, ok)) {
      fetchOptions[ok] = options[ok];
    }
  }

  // [Tác dụng] Gọi API và đọc toàn bộ body dưới dạng text
  let res = await fetch(url, fetchOptions);
  let contentType = res.headers.get("content-type") || "";
  let text = await res.text();

  // [Tác dụng] Trường hợp chuẩn: parse JSON trực tiếp theo content-type
  if (contentType.indexOf("application/json") !== -1) {
    try {
      return text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error("Phản hồi JSON không hợp lệ từ API.");
    }
  }

  // [Tác dụng] Cứu hộ: cắt phần JSON nếu body lẫn HTML (tìm {} hoặc [])
  let firstCurly = text.indexOf("{");
  let firstBracket = text.indexOf("[");
  let start = -1;
  let end = -1;

  if (firstCurly !== -1 && (firstBracket === -1 || firstCurly < firstBracket)) {
    start = firstCurly;
    end = text.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    start = firstBracket;
    end = text.lastIndexOf("]");
  }

  // [Tác dụng] Thử parse phần cắt được
  if (start !== -1 && end !== -1 && end > start) {
    let jsonSlice = text.slice(start, end + 1);
    try {
      return JSON.parse(jsonSlice);
    } catch (e2) {}
  }

  // [Tác dụng] Ném lỗi nếu không thể parse JSON
  throw new Error("Không parse được JSON từ API");
}
