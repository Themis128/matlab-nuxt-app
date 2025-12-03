from PIL import Image

Image.new("RGB", (10, 10), (255, 0, 0)).save("python_api/test_image.jpg", "JPEG")
print("created test image")
