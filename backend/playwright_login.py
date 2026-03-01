import os
from playwright.sync_api import sync_playwright

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
USER_DATA_DIR = os.getenv("PLAYWRIGHT_USER_DATA_DIR", os.path.join(BASE_DIR, ".playwright"))
LOGIN_URL = os.getenv("PLAYWRIGHT_LOGIN_URL", "https://www.xiaohongshu.com")

def main():
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            USER_DATA_DIR,
            headless=False,
            viewport={"width": 1280, "height": 720},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        )
        page = context.new_page()
        page.goto(LOGIN_URL, wait_until="networkidle", timeout=30000)
        print("请在打开的浏览器中完成登录，完成后回到终端按回车")
        input()
        context.close()

if __name__ == "__main__":
    main()
