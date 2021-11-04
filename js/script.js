const loadModel = async () => {
  const url = 'model/model.json';
  const model = await tf.loadLayersModel(url);
  return model;
};

const loadMetadata = async () => {
  const url = 'model/out.json';
  const metadata = await fetch(url);
  return metadata.json();
};

const stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now']

const exceptions= ['unu', 'edu', 'com', 'email', 'table', 'copyright','www', 'desk', 'inc', 'div', 'gef', 'eros', 'rfp', 'llc', 'org', 'net', 'ste', 'fff', 'smtp', 'prs', 'para', 'mso', 'june', 'mein', 'haben', 'wurde', 'unserer','sie', 'ihr', 'auf', 'wir', 'und', 'mit', 'ihre', 'uns', 'ein', 'jpn', 'sen', 'werden', 'anthony','quota', 'gelo', 'tzen', 'damit', 'dinge']


const remove_stopwords = (str) =>{
    const res = []
    const words = str.split(' ')
    for(let i = 0; i<words.length; ++i) {
       const word_clean = words[i].split(".").join("")
       if(!stopwords.includes(word_clean) && !exceptions.includes(word_clean)){
           res.push(word_clean)
       }
    }
    return(res.join(' '))
}  

const padSequences = (seq, max_len) => {
    if (seq.length > max_len) {
      seq.splice(0, seq.length - max_len);
    }
    if (seq.length < max_len) {
      const pad = [];
      for (let i = 0; i < max_len - seq.length; ++i) {
        pad.push(new Array(100).fill(0));
      }
      seq = seq.concat(pad);
    }
    return seq;
};

const predict = (text, model, metadata) => {
  const trimmed = remove_stopwords(text[0])
    .trim()
    .toLowerCase()
    .replace(/([^a-zA-Z])/g, " ")
    .split(" ")
    .filter(item => item);
  
  const sequence = trimmed.map((word) => {
  	const wordIndex = metadata[word];
  	if (typeof wordIndex === 'undefined') { 
    //length of words need confirmation
    return new Array(100).fill(0)
  	}
    else{return wordIndex;}
  });
  console.log(sequence)
  const paddedsequence = padSequences(sequence, 200)
  const input = tf.tensor2d(paddedsequence).reshape([1,200,100]);
  const predictOut = model.predict(input);
  const score = predictOut.dataSync()[0];
  predictOut.dispose();

  return score;
};

const getSentiment = (score) => {
  console.log(score)
  if (score > 0.8){document.getElementById("highphishing").checked = true;}
  else if (score > 0.6){document.getElementById("phishing").checked = true;}
  else if (score> 0.4){document.getElementById("neutral").checked = true;}
  else if (score > 0.2){document.getElementById("benign").checked = true;}
  else {document.getElementById("highbenign").checked = true;}
  document.getElementById("demo").innerHTML = score.toFixed(3)
};


const run = async (text) => {
  console.log(text)
  const model = await loadModel();
  console.log('loaded model')
  const metadata = await loadMetadata();
  console.log('loaded embedding')
  const perc = predict(text, model, metadata);
  console.log('predicted')
  getSentiment(perc)
};


window.onload = () => {
  const inputText = document.getElementsByTagName("textarea")[0];
  const button = document.getElementsByTagName("button")[0];
  button.onclick = () => {
    if(inputText.value.split(" ").length < 10) //confirm the text input is not too short (>=10)
    {
      alert("Please input a long enough email to start.");
      return
    }
    run([inputText.value]);
  };
};