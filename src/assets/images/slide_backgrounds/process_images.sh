convert -strip -interlace Plane -gaussian-blur 0.05 -quality 85% source.jpg result.jpg

for i in *.png; do
  convert -strip -interlace Plane -gaussian-blur 0.05 -quality 70% "$i" processed/"${i}"
done
