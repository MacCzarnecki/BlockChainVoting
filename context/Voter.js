import React, {useState, useEffect} from 'react';
import Web3Modal from "web3modal";
import {ethers} from "ethers";
import {create as ipfsHttpClient} from "ipfs-http-client";
import axios from 'axios';
import { useRouter } from 'next/router';


import {VotingAddress, VotingAddressABI} from "./constants";

const projectId = '2L5mV8bU3l6vKO8NMLxRxFxQ0VV';

const projectSecret = 'df6cdf79c013b6c3a62897e9e57ed221';

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

const fetchContract =  (signerOrProvider) => new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);

export const VotingContext = React.createContext();

export const VotingProvider = ({children}) => {
    const  votingTitle = 'My first smart contract app';
    const router = useRouter();
    const [currentAccount, setCurrentAccount] = useState('');
    const [candidateLength, setCandidateLength] = useState('');
    const pushCandidate = [];
    const candidateIndex = [];
    const [candidateArray, setCandidateArray] = useState(pushCandidate);

    //--END OF CANDIDATE

    const [error, setError] = useState('');
    const highestVote = [];

    const pushVoter = [];
    const [voterArray, setVoterArray] = useState(pushVoter);
    const [voterLength, setVoterLength] = useState('');
    const [voterAddress, setVoterAddress] = useState([]);
    
    //--CONNECTION OF METAMASK

    const chekIfWalletIsConnected = async()=>{
        if(!window.ethereum) return setError("Install MetaMsak!");

        const account = await window.ethereum.request({method: "eth_accounts"});
        if(account.length){
            setCurrentAccount(account[0])
        } else{
            setError("Install MetaMask, Connect & Reload");   
        }
    };

    //--CONNETCT WALLET

    const connectWallet = async()=>{
        if(!window.ethereum) return setError("Install MetaMask!");

        const account = await window.ethereum.request({method: "eth_requestAccounts"});
            
        setCurrentAccount(account[0]);
    };

    //--UPLOAD

    const uploadToIPFS = async(file)=>{
        try {
            var url = '';
            const added = await client.add({content: file}).then((res) => {
                console.log(res.path);
                url = "https://app-mc-ke.infura-ipfs.io/ipfs/" + res.path;
            });
            return (url);
        }catch(error){
            setError("Error Uploading file to IPFS");
        }
    }
    const uploadToIPFSCandidate = async(file)=>{
        try {
            var url = '';
            const added = await client.add({content: file}).then((res) => {
                console.log(res.path);
                url = "https://app-mc-ke.infura-ipfs.io/ipfs/" + res.path;
            });
            return (url);
        }catch(error){
            setError("Error Uploading file to IPFS");
        }
    }

    const createVoter = async(formInput, fileUrl, router)=>{
        try{
            const {name, address, position} = formInput;
            if(!name || !address || !position) 
                return setError("Missing data!");
            
            const web3Modal = new Web3Modal(); 
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);
            
            const data = JSON.stringify({name ,address, position, image: fileUrl});
            var url = '';
            const added = await client.add(data).then((res) => {
                url = "https://app-mc-ke.infura-ipfs.io/ipfs/" + res.path;
            });

            const voter = await contract.voterRight(address, name, url, fileUrl);
            voter.wait();


            router.push("/voterList");

        }catch(error){
            setError("Error in creating voter");
        }
    };

    const getAllVoterData = async()=>{
        try{
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);

        const voterListData = await contract.getVoterList();
        setVoterAddress(voterListData);

        voterListData.map(async(el)=>{
            const singleVoterData = await contract.getVoterData(el);
            pushVoter.push(singleVoterData);
        });

        const voterList = await contract.getVoterLength();
        setVoterLength(voterList.toNumber());
    }catch{
        setError("Something went wrong fething the data");
    }
    
    };

    //----GIVE VOTE

    const giveVote = async(id) => {
        try {
            const voterAddress = id.address;
            const voterId = id.id;
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);

            const voteredList = await contract.vote(voterAddress, voterId);
            console.log(voteredList);
        } catch (error){
            console.log(error)
        }
    }

    const setCandidate = async (candidateForm, fileUrl, router) => {
        try{
            const {name, address, age} = candidateForm;
            if(!name || !address || !age) 
                return setError("Missing data!");
            
            const web3Modal = new Web3Modal(); 
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);
            
            const data = JSON.stringify({name ,address, image: fileUrl, age});
            var ipfs = '';
            const added = await client.add(data).then((res) => {
                ipfs = "https://app-mc-ke.infura-ipfs.io/ipfs/" + res.path;
            });

            const candidate = await contract.setCandidate(address, age, name, fileUrl, ipfs);
            candidate.wait();

            router.push("/");

        }catch(error){
            setError("Error in creating candidate");
        }
    };

    const getNewCandidate = async()=>{
        try {
            const web3Modal = new Web3Modal(); 
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);

            //-----ALL CANDIDATE
            const allCandidate = await contract.getCandidate();

            allCandidate.map(async(el)=>{
                const singleCandidateData = await contract.getCandidateData(el);

                pushCandidate.push(singleCandidateData);
                candidateIndex.push(singleCandidateData[2].toNumber());
            });

            const allCandidateLength = await contract.getCandidateLength();
            setCandidateLength(allCandidateLength.toNumber());
        }catch(error){
            console.log(error);
        }
    }

    useEffect(() =>{
        getNewCandidate();
    }, [])

    return (<VotingContext.Provider 
    value={{
        votingTitle,
        chekIfWalletIsConnected,
        connectWallet,
        uploadToIPFS,
        createVoter,
        setCandidate,
        getAllVoterData,
        getNewCandidate,
        giveVote,
        error,
        voterArray,
        voterLength,
        voterAddress,
        currentAccount,
        candidateLength,
        candidateArray,
        uploadToIPFSCandidate
        }}
    >
        {children}
    </VotingContext.Provider>);
};
