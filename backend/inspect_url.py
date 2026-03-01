import sys
from services.ai_processor import get_content_from_url

def main():
    if len(sys.argv) < 2:
        print("URL is required")
        return
    url = sys.argv[1]
    text = get_content_from_url(url)
    print("len", 0 if text is None else len(text))
    print(text or "")

if __name__ == "__main__":
    main()
