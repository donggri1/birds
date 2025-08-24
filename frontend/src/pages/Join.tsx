/**
 * 회원가입 페이지 컴포넌트입니다.
 * 사용자가 이메일, 닉네임, 비밀번호를 입력하여 가입할 수 있는 폼을 제공합니다.
 */
export default function Join() {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">회원가입</h1>
      <form className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일</label>
          <input type="email" id="email" name="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="nick" className="block text-sm font-medium text-gray-700">닉네임</label>
          <input type="text" id="nick" name="nick" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">비밀번호</label>
          <input type="password" id="password" name="password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">가입하기</button>
      </form>
      {/* TODO: 추후 이곳에 카카오 로그인 버튼을 추가합니다. */}
    </div>
  );
}
