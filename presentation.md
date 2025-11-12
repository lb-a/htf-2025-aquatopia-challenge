---
title: "HTF25 Aquatopia Challenge"
author: MaranzasDiBrugge
---


<!-- alignment: center -->

Who are we
---

* International Students from Howest
* 0 AWS experince 
* 0 Dutch knowledge (after 3+ years in Belgium)
* 100% Having too much fun


<!-- end_slide -->

<!-- alignment: center -->

What We Had To Make
---
 
* Level 1 - Sonar Signal Classifier
  Ingest EventBridge events, validate, classify, publish to **SNS**.  

* Level 2 & 3 - Sonar Observation Ingest
  Ingest **SNS** messages, write to destination.  

* Level 4 - Dark Signal Decipherer 
  Decode **dark signals** from **SNS**, forward plaintext to **SQS**.  

* Level 5 - Sonar Message Translator
  Translate dark messages, POST via webhook.  


![Architecture](img/HTF-2025-Architecture.png)

<!-- end_slide -->

What We Did
---

<!-- column_layout: [1, 1] -->

<!-- pause -->

<!-- column: 0 -->

# What Works

* Signal Classification (Level 1)
* DynamoDB Ingestion (Level 2)
* Decryption and Translation (Level 4)

<!-- pause -->

<!-- column: 1 -->

# What Doesnt 

* OpenSearch Alerts (Level 3)
* Level 5 (ran out of time)

<!-- end_slide -->


The Challenges 
---

<!-- pause -->

## Time Constraints
* Team mate arrived an hour and a half late ( quite on time for Italy btw)

<!-- pause -->

## Communication Problems
* Next time take a coat with you to parties LEO 

<!-- pause -->

## Learning To Use AWS Stack
* We both never used it before 


<!-- end_slide -->



Conclusion
---


## Vibing is fun
## AWS is really not for us, but still somehow better then Microsoft %^$@
## Despite of our lack of knowledge, the project was extremely fun. 

---

# Thank you to the amazing coaches for guiding us though this challenge

---

<!-- alignment: right -->

**Team MaranzasDiBrugge**

*HTF25 Aquatopia Challenge*

<!-- end_slide -->

```bash +exec
aws logs tail /aws/lambda/HTF25-MaranzasDiBrugge-DarkSignalDecipherer --follow --region eu-central-1
