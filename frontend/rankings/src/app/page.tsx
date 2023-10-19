'use client';
import Image from 'next/image'
import styles from './page.module.css'
import axios from 'axios'
import ClipboardJS from 'clipboard';
import React , {useState, useEffect} from 'react';
import { json } from 'stream/consumers';




export default function Home() {

  const [asinNumber, setAsinNumber] = useState<string>("")
  const [asin, setAsin] = useState<string>("");
  const [rank, setRank] = useState<string | null>(null);
  const [page, setPage] = useState<string | null>(null);

  const [noProduct, setNoProduct] = useState<boolean>(false)

  const [resultsList, setResultsList] = useState<Array<{ asin: string; rank: string | null; page: string | null }>>([]);

  const[loading, setLoading]  = useState<boolean>(false)

  const[keywords, setKeywords] = useState<string>("")
  const [keywordList, setKeywordList] = useState<string[]>([]);

  const handleAsinChange = (event: React.ChangeEvent<HTMLInputElement>) =>{
    let asinInput = document.getElementById('asinInput');
    asinInput?.classList.remove(styles.redBorder);
    setAsinNumber(event.target.value);
  };

  const handleKeywordsChange = (event: React.ChangeEvent<HTMLInputElement>) =>{
    let keywordsInput = document.getElementById('keywordsInput');
    keywordsInput?.classList.remove(styles.redBorderKey);
    setKeywords(event.target.value);
  };

  const handleKeywordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
   
    event.preventDefault();
    if (keywords.trim() === '') return; // Ignore empty keywords
    setKeywordList([...keywordList, keywords]);
    setKeywords('');
  };

  const handleKeywordDelete = (index: number) => {
    const updatedKeywords = [...keywordList];
    updatedKeywords.splice(index, 1);
    setKeywordList(updatedKeywords);
  };

  const handleSendClick = async () => {
    let asinInput = document.getElementById('asinInput');
    let keywordsInput = document.getElementById('keywordsInput');
    console.log(keywordList)
    if (!asinNumber.trim() || keywordList.length == 0) {
      // If ASIN or keywords are not entered, apply red border
      if (keywordList.length == 0) {
        console.log("condition")
        keywordsInput?.classList.add(styles.redBorderKey);
      } 
      if (!asinNumber.trim()) {
        asinInput?.classList.add(styles.redBorder);
      } 
  

      return;
    }

    setLoading(true);

    var keywordsString = ""

    for(var i = 0 ; i<keywordList.length ; i++){
      if(i == keywordList.length-1)
      {
        keywordsString += keywordList[i] 
      }
      else
      {
        keywordsString += keywordList[i] + "+"
      }
    }

    console.log(keywordsString)
    
    try{

    const response  = await axios.get("http://localhost:5000/amazon-product", {
      params: {
        ASIN:asinNumber,
        keywords: keywordsString
      }
    })
  
  
  console.log(response.data.firstLineData == "not found")

  if(response.data.firstLineData == "not found")
  {
    setRank("Not found")
    setPage("Not found")
    setAsin(asinNumber)
    setResultsList((prevResults) => [
      ...prevResults,
      { asin: asinNumber, rank: "Not found", page: "Not found" },
    ]);
    
  }


 if (response.data && response.data.firstLineData) {
    // Parse the JSON string from the response
    const jsonData = JSON.parse(response.data.firstLineData);
    console.log(jsonData)
    console.log(jsonData.ASIN)

    if (Array.isArray(jsonData) && jsonData.length > 0) {
      const firstResult = jsonData[0];
      setAsin(firstResult.ASIN || "");
      setRank(firstResult.Rank || null);
      setPage(firstResult.Page || null);
      setResultsList((prevResults) => [
        ...prevResults,
        { asin: firstResult.ASIN || "", rank: firstResult.Rank || null, page: firstResult.Page || null },
      ]);
    }
  }

  }
  catch(error){
    console.log(error)
  }
  finally{
    console.log(asin)
    console.log(rank)
    console.log(page)

    setKeywords('');
    setLoading(false)
  }
  };

  return (
    <main className={styles.main}>

      <div className={styles.mainColumn}>

      <div className={styles.pageTitle}>
        <h1>Amazon rankings</h1>
      </div>

      </div>


      {/* New Input and Button */}

      <div className={styles.pageContent}>

      <div className={styles.leftContainer}>
        <div className={styles.inputContainer}>
         
          <div className={styles.asinInput}>
            <input
              id="asinInput"
              className={styles.inputAsin}
              type="text"
              placeholder="Enter the ASIN number "
              value={asinNumber}
              onChange={handleAsinChange}
            />
            <button
              className={styles.sendButton}
              onClick={handleSendClick}
            >
              Get ranking
            </button>
          </div>
         
          <form onSubmit={handleKeywordSubmit}>
            <div className={styles.keywordsInput}>
              <input
                className={styles.inputKeywords}
                id="keywordsInput"
                type="text"
                placeholder="Enter keywords"
                value={keywords}
                onChange={handleKeywordsChange}
              />
              <button
                className={styles.addButton}
                type="submit"
              >
                Add
              </button>
            </div>
          </form>

          <div className={styles.keywordList}>
            {keywordList.map((keyword, index) => (
              <div key={index} className={styles.keyword}>
                <span>{keyword}</span>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleKeywordDelete(index)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        
        </div>
      </div>

      <div className={styles.rightContainer}>
  <div className={styles.titleContainer}>
    <h2>Rankings</h2>
  </div>
  <div className={styles.rankingsTable}>
    <div className={styles.rankingsHeader}>
      <div className={styles.column}>ASIN</div>
      <div className={styles.column}>Page number</div>
      <div className={styles.column}>Position on page</div>
    </div>
    {loading ? ( // Display loading icon if loading is true
          <div className={styles.loadingDiv}>
            <img src="/assets/Dual-Ring-removebg.png" className={styles.loadingIcon} alt="Loading" />
          </div>
        ) : (
          resultsList.map((result, index) => (
            <div key={index} className={styles.rankingsData}>
              <div className={styles.column}>{result.asin}</div>
              <div className={styles.column}>{result.page}</div>
              <div className={styles.column}>{result.rank}</div>
            </div>
          ))
        )}
  </div>
</div>

        </div>

      {/* Display the response text */}
      
      <div className={styles.grid}>
        {/* Existing Card Links */}
        {/* ... (keep the existing card links) */}
      </div>
    </main>
  )
}
