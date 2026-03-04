
import re

def check_tags(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple regex to find tags
    # This won't be perfect for all JSX but should catch most div and major tags
    tags = re.findall(r'<(/?[a-zA-Z0-9\.]+)', content)
    
    stack = []
    for t in tags:
        # Ignore self-closing tags if identified by ending in />
        # However re.findall above doesn't check for />
        # Let's refine the regex or check the context
        pass

    # Better approach: find all non-self-closing tags
    content_clean = re.sub(r'<[a-zA-Z0-9\.]+\s+[^>]*/>', '', content)
    content_clean = re.sub(r'<Link\b[^>]*>', '<Link>', content_clean) # Links are often multi-line
    
    tags = re.findall(r'<(div|motion\.div|AnimatePresence|Helmet|NotifyMeModal|RecentlyViewed|Link|Price|Skeleton|button|span|h[1-6]|p|img|video|select|option|label|textarea|del|Star|Minus|Plus|Share2|Heart|ShoppingBag|ChevronRight|ChevronLeft|Zap|ArrowLeft|Camera|Video|Play|Maximize2|Download|ExternalLink|LinkIcon|Home|X|Loader2|BellRing|Check|Sparkles|ShieldCheck|RotateCcw|Lock|Award)|</(div|motion\.div|AnimatePresence|Helmet|NotifyMeModal|RecentlyViewed|Link|Price|Skeleton|button|span|h[1-6]|p|img|video|select|option|label|textarea|del|Star|Minus|Plus|Share2|Heart|ShoppingBag|ChevronRight|ChevronLeft|Zap|ArrowLeft|Camera|Video|Play|Maximize2|Download|ExternalLink|LinkIcon|Home|X|Loader2|BellRing|Check|Sparkles|ShieldCheck|RotateCcw|Lock|Award)>', content)
    
    stack = []
    for open_tag, close_tag in tags:
        if open_tag:
            # Check if it was self-closing in the original content (heuristic)
            # This is hard. Let's just focus on divs for now as they are the most likely culprit
            if open_tag == 'div' or open_tag == 'motion.div' or open_tag == 'AnimatePresence':
                stack.append(open_tag)
        elif close_tag:
            if stack and stack[-1] == close_tag:
                stack.pop()
            else:
                print(f"Mismatch: found </{close_tag}> but stack is {stack}")
    
    print(f"Final unclosed stack: {stack}")

if __name__ == "__main__":
    check_tags('c:/Users/Admin/Desktop/HighPhaus/client/src/pages/ProductDetails.jsx')
