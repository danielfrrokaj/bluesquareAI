#!/bin/zsh
# usage: gen_gemini.sh <ref.png> <out.png> <subject>   (needs GEMINI_API_KEY)
ref=$1; out=$2; subject=$3; tmp=$(mktemp -d)
python3 -I - "$ref" "$subject" > $tmp/body.json <<'PY'
import base64, json, sys
ref, subject = sys.argv[1:3]
prompt = ("Create a NEW 3D icon in exactly the same visual style as the reference icon "
  "(same isometric three-quarter view, same glossy and frosted-glass materials, same soft studio lighting, "
  "same rounded geometry and level of detail). Subject: " + subject + ". "
  "Strict palette: bright azure blue #4A84D0, deep navy #061238 and white highlights only. "
  "Centered with generous padding, the object filling about 70% of the frame. "
  "Plain solid pure white #FFFFFF background, completely flat, no gradient, no vignette, no floor, "
  "no glow or cast shadow on the background. No text, no letters, no logos. Square 1:1.")
print(json.dumps({"contents":[{"parts":[{"inline_data":{"mime_type":"image/png","data":base64.b64encode(open(ref,"rb").read()).decode()}},{"text":prompt}]}],
  "generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":"1:1"}}}))
PY
curl -sS --max-time 280 "https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL:-gemini-3-pro-image}:generateContent" \
  -H "Content-Type: application/json" -H "x-goog-api-key: $GEMINI_API_KEY" -d @$tmp/body.json > $tmp/resp.json
python3 -I - "$tmp/resp.json" "$out" <<'PY'
import base64, json, sys
r = json.load(open(sys.argv[1]))
try:
    for p in r["candidates"][0]["content"]["parts"]:
        d = p.get("inlineData") or p.get("inline_data")
        if d: open(sys.argv[2], "wb").write(base64.b64decode(d["data"])); print("ok", sys.argv[2]); break
    else: print("ERR no image", sys.argv[2])
except Exception: print("ERR", sys.argv[2], json.dumps(r)[:300])
PY
rm -rf $tmp
