import React, {useState, useEffect, useContext} from "react";

import voterCard from "../components/VoterCard/VoterCard";
import Style from '../styles/voterList.module.css'
import {VotingContext} from "../context/Voter";
import VoterCard from "../components/VoterCard/VoterCard";

const voterList = () => {

  const {getAllVoterData, voterArray} = useContext(VotingContext);
  useEffect(() => {
    getAllVoterData();
  })
  return (
    <div className={Style.voterList}>
      <VoterCard voterArray={voterArray}></VoterCard>
    </div>
  );
};

export default voterList;
