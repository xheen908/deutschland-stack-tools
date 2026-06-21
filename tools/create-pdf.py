from PIL import Image

def create_pdf():
    # Load images
    image1 = Image.open('/Users/xheen908/.gemini/antigravity-ide/brain/b54c8d97-1178-45fe-86dd-90b0f93c6572/wba_page_1_1782055881547.png').convert('RGB')
    image2 = Image.open('/Users/xheen908/.gemini/antigravity-ide/brain/b54c8d97-1178-45fe-86dd-90b0f93c6572/wba_page_2_1782055892873.png').convert('RGB')
    image3 = Image.open('/Users/xheen908/.gemini/antigravity-ide/brain/b54c8d97-1178-45fe-86dd-90b0f93c6572/wba_page_3_1782055904710.png').convert('RGB')
    image4 = Image.open('/Users/xheen908/.gemini/antigravity-ide/brain/b54c8d97-1178-45fe-86dd-90b0f93c6572/wba_page_4_1782055914502.png').convert('RGB')

    # Save as PDF
    pdf_path = '/Users/xheen908/deutschland-stack-tools/test-wba-komplett.pdf'
    image1.save(pdf_path, save_all=True, append_images=[image2, image3, image4])
    print(f"PDF successfully created at {pdf_path}")

if __name__ == "__main__":
    create_pdf()
